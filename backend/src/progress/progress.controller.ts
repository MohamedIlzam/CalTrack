import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('weight')
  async recordWeight(@Req() req: any, @Body('weightKg') weightKg: any) {
    const numericWeight = parseFloat(weightKg);
    if (
      !Number.isFinite(numericWeight) ||
      numericWeight < 20 ||
      numericWeight > 500
    ) {
      throw new BadRequestException('weightKg must be between 20 and 500');
    }
    return this.progressService.recordWeight(req.user.id, numericWeight);
  }

  @Get('weight')
  async getWeightHistory(@Req() req: any) {
    return this.progressService.getWeightHistory(req.user.id);
  }

  @Get('adherence')
  async getAdherence(@Req() req: any, @Query('days') days?: string) {
    const daysLimit = days ? parseInt(days, 10) : 7;
    if (!Number.isInteger(daysLimit) || daysLimit < 1 || daysLimit > 365) {
      throw new BadRequestException(
        'days query parameter must be between 1 and 365',
      );
    }
    return this.progressService.getAdherence(req.user.id, daysLimit);
  }
}
