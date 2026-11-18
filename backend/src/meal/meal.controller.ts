import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { MealService, LogFoodDto, UpdateMealEntryDto } from './meal.service';
import { NutritionCalculatorService, MealPreviewDto } from '../food/nutrition-calculator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meal')
@UseGuards(JwtAuthGuard)
export class MealController {
  constructor(
    private readonly mealService: MealService,
    private readonly nutritionCalculator: NutritionCalculatorService,
  ) {}

  @Post('preview')
  async previewMeal(@Body() dto: MealPreviewDto) {
    return this.nutritionCalculator.calculateMeal(dto);
  }

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

  @Patch('entry/:id')
  async updateEntry(
    @Req() req: any,
    @Param('id') entryId: string,
    @Body() dto: UpdateMealEntryDto,
  ) {
    if (!entryId) {
      throw new BadRequestException('entry ID is required');
    }

    if (dto.meal) {
      const upperMeal = dto.meal.toUpperCase();
      if (upperMeal === 'SNACK') {
        dto.meal = 'SNACKS';
      } else if (!['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(upperMeal)) {
        throw new BadRequestException('meal must be BREAKFAST, LUNCH, DINNER, or SNACKS');
      } else {
        dto.meal = upperMeal as any;
      }
    }

    if (dto.servingQuantity !== undefined && (!Number.isFinite(dto.servingQuantity) || dto.servingQuantity <= 0)) {
      throw new BadRequestException('servingQuantity must be a positive number');
    }

    if (dto.loggedCaloriesKcal !== undefined && (!Number.isFinite(dto.loggedCaloriesKcal) || dto.loggedCaloriesKcal < 0 || dto.loggedCaloriesKcal > 5000)) {
      throw new BadRequestException('loggedCaloriesKcal must be between 0 and 5000');
    }

    if (
      (dto.loggedProteinG !== undefined && (!Number.isFinite(dto.loggedProteinG) || dto.loggedProteinG < 0 || dto.loggedProteinG > 500)) ||
      (dto.loggedCarbohydratesG !== undefined && (!Number.isFinite(dto.loggedCarbohydratesG) || dto.loggedCarbohydratesG < 0 || dto.loggedCarbohydratesG > 500)) ||
      (dto.loggedFatG !== undefined && (!Number.isFinite(dto.loggedFatG) || dto.loggedFatG < 0 || dto.loggedFatG > 500))
    ) {
      throw new BadRequestException('Macronutrients must be between 0 and 500 grams');
    }

    return this.mealService.updateEntry(req.user.id, entryId, dto);
  }

  @Delete('entry/:id')
  async deleteEntry(@Req() req: any, @Param('id') entryId: string) {
    if (!entryId) {
      throw new BadRequestException('entry ID is required');
    }
    return this.mealService.deleteEntry(req.user.id, entryId);
  }
}
