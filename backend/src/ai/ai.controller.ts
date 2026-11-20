import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ServiceUnavailableException,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { AiService, SyntheticDemoContext } from './ai.service';
import { DiarySummaryService } from './diary-summary.service';
import { CieCoachService } from './intelligence/cie-coach.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { resolveDiaryDate } from '../common/date.util';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly diarySummaryService: DiarySummaryService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @Optional() private readonly cieCoachService?: CieCoachService,
  ) {}

  private async enforceRateLimit(userId: string): Promise<void> {
    const rateLimitKey = `ratelimit:ai:${userId}`;
    try {
      // Fixed-window rate limiter: 15 requests per 60 seconds (protects free-tier Gemini API quota)
      const { allowed } = await this.redisService.checkRateLimit(rateLimitKey, 15, 60);
      if (!allowed) {
        throw new HttpException(
          'Rate limit reached: Maximum 15 AI requests per minute. Please wait a moment before trying again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      // Fail closed: If Redis is unavailable or returns an error, reject request with HTTP 503
      throw new ServiceUnavailableException(
        'Rate limit service temporarily unavailable. Request blocked to protect API quotas. Please try again shortly.',
      );
    }
  }

  @Post('chat')
  async chat(
    @Req() req: AuthenticatedRequest,
    @Body('message') message: string,
    @Body('includeDemoContext') includeDemoContext?: boolean,
    @Body('date') dateStr?: string,
    @Body('timeZone') timeZone?: string,
  ) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('message string parameter is required and cannot be empty');
    }

    const trimmed = message.trim();
    if (trimmed.length > 1000) {
      throw new BadRequestException('message length exceeds maximum allowed limit of 1000 characters');
    }

    const userId = req.user.id;
    await this.enforceRateLimit(userId);

    // Feature Flag & CIE Routing:
    // When CIE_ENABLED=true, route message through CalTrack Intelligence Engine.
    // If handled, return authoritative response without transmitting user diary data to external LLMs.
    // When CIE_ENABLED=false (default), preserve existing regex diary intent handling.
    const isCieEnabled = process.env.CIE_ENABLED === 'true';
    if (isCieEnabled && this.cieCoachService) {
      const cieAnswer = await this.cieCoachService.handleCoachMessage(
        userId,
        trimmed,
        dateStr,
        timeZone,
      );
      if (cieAnswer) {
        return cieAnswer;
      }
    } else {
      // Authoritative Legacy Diary Handling:
      // If user is querying today's intake, macros, logged meals, or past dates,
      // respond deterministically using authentic PostgreSQL records.
      // Zero private user diary data is transmitted to Gemini.
      const diaryAnswer = await this.diarySummaryService.tryHandleCoachDiaryIntent(
        userId,
        trimmed,
        dateStr,
        timeZone,
      );
      if (diaryAnswer) {
        return diaryAnswer;
      }
    }

    // Timezone consistency: resolve date consistently with Home and Search, avoiding server UTC clock skew
    const { dateStr: resolvedDate } = resolveDiaryDate(dateStr, timeZone);

    // Strict Privacy Boundary Enforcement (Gemini Free Tier):
    // Real user profile metrics, personal targets, and actual diary consumption are strictly excluded
    // from outgoing LLM payloads in backend code.
    // If demo context is requested, a static synthetic archetype fixture is provided instead.
    const demoFixture: SyntheticDemoContext | undefined = includeDemoContext
      ? {
          isSyntheticDemo: true,
          goal: 'General Wellness (Synthetic Demo Archetype)',
          targetCalories: 2000,
          targetProteinG: 125,
          targetCarbsG: 225,
          targetFatG: 65,
        }
      : undefined;

    return this.aiService.askCoach(trimmed, demoFixture);
  }

  @Post('parse-prompt')
  async parsePrompt(@Req() req: AuthenticatedRequest, @Body('prompt') prompt: string) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new BadRequestException('prompt string parameter is required and cannot be empty');
    }

    const trimmed = prompt.trim();
    if (trimmed.length > 500) {
      throw new BadRequestException('prompt length exceeds maximum allowed limit of 500 characters');
    }

    await this.enforceRateLimit(req.user.id);

    return this.aiService.parsePrompt(trimmed);
  }

  @Post('scan-image')
  async scanImage(@Req() req: AuthenticatedRequest, @Body('imageBase64') imageBase64: string) {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new BadRequestException('imageBase64 string parameter is required');
    }

    // Maximum payload limit of 7MB in base64 string (~5MB decoded binary image)
    if (imageBase64.length > 7000000) {
      throw new BadRequestException('Image payload exceeds maximum 5MB size limit');
    }

    if (imageBase64.length < 50) {
      throw new BadRequestException('Image payload is too small or invalid');
    }

    // MIME type validation if data URI is provided
    if (imageBase64.startsWith('data:')) {
      const isSupportedMime = /^data:image\/(jpeg|jpg|png|webp|heic);base64,/i.test(imageBase64);
      if (!isSupportedMime) {
        throw new BadRequestException(
          'Unsupported image format. Allowed image formats: JPEG, PNG, WEBP, HEIC',
        );
      }
    }

    await this.enforceRateLimit(req.user.id);

    return this.aiService.scanImage(imageBase64);
  }
}
