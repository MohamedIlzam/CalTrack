import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RedisService } from '../redis/redis.service';
import {
  normalizeEmail,
  validateLoginPassword,
  validateName,
  validateRegistrationPassword,
} from './auth.validation';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  private async enforceAuthRateLimit(
    action: 'login' | 'register',
    email: string,
  ): Promise<void> {
    const identity = createHash('sha256').update(email).digest('hex');
    const limit = action === 'login' ? 10 : 5;
    const windowSeconds = action === 'login' ? 900 : 3600;
    try {
      const [identityResult, globalResult] = await Promise.all([
        this.redisService.checkRateLimit(
          `ratelimit:auth:${action}:identity:${identity}`,
          limit,
          windowSeconds,
        ),
        this.redisService.checkRateLimit(
          `ratelimit:auth:${action}:global`,
          action === 'login' ? 300 : 60,
          windowSeconds,
        ),
      ]);
      if (!identityResult.allowed || !globalResult.allowed) {
        throw new HttpException(
          'Too many authentication attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(
        'Authentication is temporarily unavailable. Please try again shortly.',
      );
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: any) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      throw new BadRequestException('A valid registration body is required');
    }
    const email = normalizeEmail(dto.email);
    const password = validateRegistrationPassword(dto.password);
    const name = validateName(dto.name);
    await this.enforceAuthRateLimit('register', email);
    return this.authService.register({ ...dto, email, password, name });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: any) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      throw new BadRequestException('A valid login body is required');
    }
    const email = normalizeEmail(dto.email);
    const password = validateLoginPassword(dto.password);
    await this.enforceAuthRateLimit('login', email);
    return this.authService.login({ email, password });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: any) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      throw new BadRequestException('A valid profile body is required');
    }
    return this.authService.updateProfile(req.user.id, dto);
  }
}
