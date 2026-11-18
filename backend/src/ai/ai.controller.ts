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
} from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
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
  async chat(@Req() req: AuthenticatedRequest, @Body('message') message: string) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('message string parameter is required and cannot be empty');
    }

    const trimmed = message.trim();
    if (trimmed.length > 1000) {
      throw new BadRequestException('message length exceeds maximum allowed limit of 1000 characters');
    }

    const userId = req.user.id;
    await this.enforceRateLimit(userId);

    // Fetch authoritative user profile from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const userContext = user
      ? {
          name: user.name,
          goal: user.goal,
          targetCalories: user.targetCalories ?? 2000,
          targetProteinG: user.targetProteinG ?? 120,
          targetCarbsG: user.targetCarbsG ?? 220,
          targetFatG: user.targetFatG ?? 60,
          weightKg: user.weightKg ?? undefined,
        }
      : undefined;

    // Fetch authoritative today's meal log from database
    const now = new Date();
    const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const log = await this.prisma.mealLog.findUnique({
      where: { userId_date: { userId, date: todayDate } },
      include: { entries: true },
    });

    const todaySummary =
      log && log.entries && log.entries.length > 0
        ? {
            consumedCalories: Math.round(
              log.entries.reduce((sum, e) => sum + e.loggedCaloriesKcal, 0),
            ),
            consumedProtein: Math.round(
              log.entries.reduce((sum, e) => sum + e.loggedProteinG, 0),
            ),
            consumedCarbs: Math.round(
              log.entries.reduce((sum, e) => sum + e.loggedCarbohydratesG, 0),
            ),
            consumedFat: Math.round(
              log.entries.reduce((sum, e) => sum + e.loggedFatG, 0),
            ),
            mealsCount: log.entries.length,
          }
        : undefined;

    return this.aiService.askCoach(trimmed, userContext, todaySummary);
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
