import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { MealService, LogFoodDto } from './meal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meal')
@UseGuards(JwtAuthGuard)
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('daily')
  async getDailyLog(@Req() req: any, @Query('date') dateStr: string) {
    if (!dateStr) {
      throw new BadRequestException('date query parameter is required (YYYY-MM-DD)');
    }
    return this.mealService.getDailyLog(req.user.id, dateStr);
  }

  @Post('log')
  async logFood(@Req() req: any, @Body() dto: LogFoodDto) {
    if (!dto.date || !dto.meal || !dto.unitName || dto.servingQuantity === undefined) {
      throw new BadRequestException('date, meal, unitName, and servingQuantity are required fields');
    }
    
    // Map lowercase UI meal slots to DB uppercase slots if necessary
    const upperMeal = dto.meal.toUpperCase();
    if (upperMeal === 'SNACK') {
      dto.meal = 'SNACKS';
    } else if (!['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(upperMeal)) {
      throw new BadRequestException('meal must be BREAKFAST, LUNCH, DINNER, or SNACKS');
    } else {
      dto.meal = upperMeal as any;
    }

    return this.mealService.logFood(req.user.id, dto);
  }

  @Delete('entry/:id')
  async deleteEntry(@Req() req: any, @Param('id') entryId: string) {
    if (!entryId) {
      throw new BadRequestException('entry ID is required');
    }
    return this.mealService.deleteEntry(req.user.id, entryId);
  }
}
