import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MealService, LogFoodDto, UpdateMealEntryDto } from './meal.service';
import {
  NutritionCalculatorService,
  MealPreviewDto,
} from '../food/nutrition-calculator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meal')
@UseGuards(JwtAuthGuard)
export class MealController {
  constructor(
    private readonly mealService: MealService,
    private readonly nutritionCalculator: NutritionCalculatorService,
  ) {}

  private validateDate(date: unknown): asserts date is string {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must be a valid YYYY-MM-DD value');
    }
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() + 1 !== month ||
      parsed.getUTCDate() !== day
    ) {
      throw new BadRequestException('date must be a valid calendar date');
    }
  }

  private validateEntryValues(dto: LogFoodDto | UpdateMealEntryDto): void {
    const bounded = (
      value: unknown,
      field: string,
      minimum: number,
      maximum: number,
    ) => {
      if (
        value !== undefined &&
        (typeof value !== 'number' ||
          !Number.isFinite(value) ||
          value < minimum ||
          value > maximum)
      ) {
        throw new BadRequestException(
          `${field} must be between ${minimum} and ${maximum}`,
        );
      }
    };
    bounded(dto.servingQuantity, 'servingQuantity', 0.01, 100);
    bounded(dto.loggedWeightGrams, 'loggedWeightGrams', 0, 10000);
    bounded(dto.loggedCaloriesKcal, 'loggedCaloriesKcal', 0, 5000);
    bounded(dto.loggedProteinG, 'loggedProteinG', 0, 500);
    bounded(dto.loggedCarbohydratesG, 'loggedCarbohydratesG', 0, 500);
    bounded(dto.loggedFatG, 'loggedFatG', 0, 500);
    if (
      dto.unitName !== undefined &&
      (typeof dto.unitName !== 'string' ||
        !dto.unitName.trim() ||
        dto.unitName.length > 80)
    ) {
      throw new BadRequestException(
        'unitName must be between 1 and 80 characters',
      );
    }
  }

  @Post('preview')
  async previewMeal(@Body() dto: MealPreviewDto) {
    return this.nutritionCalculator.calculateMeal(dto);
  }

  @Get('daily')
  async getDailyLog(@Req() req: any, @Query('date') dateStr: string) {
    this.validateDate(dateStr);
    return this.mealService.getDailyLog(req.user.id, dateStr);
  }

  @Post('log')
  async logFood(@Req() req: any, @Body() dto: LogFoodDto) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      throw new BadRequestException('A valid meal entry body is required');
    }
    if (
      !dto.date ||
      !dto.meal ||
      !dto.unitName ||
      dto.servingQuantity === undefined
    ) {
      throw new BadRequestException(
        'date, meal, unitName, and servingQuantity are required fields',
      );
    }
    this.validateDate(dto.date);
    this.validateEntryValues(dto);

    // Map lowercase UI meal slots to DB uppercase slots if necessary
    const upperMeal = dto.meal.toUpperCase();
    if (upperMeal === 'SNACK') {
      dto.meal = 'SNACKS';
    } else if (
      !['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(upperMeal)
    ) {
      throw new BadRequestException(
        'meal must be BREAKFAST, LUNCH, DINNER, or SNACKS',
      );
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
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      throw new BadRequestException('A valid meal entry body is required');
    }

    if (dto.meal) {
      const upperMeal = dto.meal.toUpperCase();
      if (upperMeal === 'SNACK') {
        dto.meal = 'SNACKS';
      } else if (
        !['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(upperMeal)
      ) {
        throw new BadRequestException(
          'meal must be BREAKFAST, LUNCH, DINNER, or SNACKS',
        );
      } else {
        dto.meal = upperMeal as any;
      }
    }

    this.validateEntryValues(dto);

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
