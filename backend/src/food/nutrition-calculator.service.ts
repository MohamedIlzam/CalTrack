import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MealPreviewItemDto {
  foodId: string;
  quantity: number;
  unitName: string;
}

export interface MealPreviewDto {
  items: MealPreviewItemDto[];
}

export interface CalculatedNutrients {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
}

export interface PreviewItemResult extends CalculatedNutrients {
  foodId: string;
  name: string;
  quantity: number;
  unitName: string;
  grams: number;
  isVerified?: boolean;
}

export interface MealPreviewResponse {
  items: PreviewItemResult[];
  totals: CalculatedNutrients;
}

@Injectable()
export class NutritionCalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deterministically calculates nutrition for an array of meal items using
   * authoritative PostgreSQL Food records and their UnitConversion records.
   *
   * Formula:
   *   grams = quantity * gramEquivalent
   *   caloriesKcal = round((food.caloriesKcal / 100) * grams)
   *   macrosG = round((food.macroG / 100) * grams, 1 decimal)
   *
   * @param dto Request containing the items array
   * @returns Detailed item breakdown and aggregated totals
   */
  async calculateMeal(dto: MealPreviewDto): Promise<MealPreviewResponse> {
    if (!dto || typeof dto !== 'object' || !Array.isArray(dto.items)) {
      throw new BadRequestException('Request body must be an object with an "items" array');
    }

    const { items } = dto;

    if (items.length === 0) {
      throw new BadRequestException('The "items" array must contain at least one food item');
    }

    if (items.length > 50) {
      throw new BadRequestException('The "items" array cannot exceed 50 items per preview');
    }

    // 1. Strict validation of all input items
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Item at index ${index} must be an object`);
      }

      if (!item.foodId || typeof item.foodId !== 'string' || !item.foodId.trim()) {
        throw new BadRequestException(`Item at index ${index} must have a valid non-empty "foodId" string`);
      }

      if (
        typeof item.quantity !== 'number' ||
        !Number.isFinite(item.quantity) ||
        Number.isNaN(item.quantity)
      ) {
        throw new BadRequestException(
          `Quantity for foodId "${item.foodId}" at index ${index} must be a valid finite number`,
        );
      }

      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Quantity for foodId "${item.foodId}" at index ${index} must be greater than zero`,
        );
      }

      if (item.quantity > 100) {
        throw new BadRequestException(
          `Quantity for foodId "${item.foodId}" at index ${index} exceeds maximum allowable limit of 100`,
        );
      }

      if (!item.unitName || typeof item.unitName !== 'string' || !item.unitName.trim()) {
        throw new BadRequestException(
          `Item at index ${index} (foodId "${item.foodId}") must have a valid non-empty "unitName" string`,
        );
      }
    }

    // 2. Fetch authoritative Food records and all their associated UnitConversions
    const uniqueFoodIds = Array.from(new Set(items.map((i) => i.foodId.trim())));
    const foods = await this.prisma.food.findMany({
      where: {
        id: { in: uniqueFoodIds },
      },
      include: {
        unitConversions: true,
      },
    });

    const foodMap = new Map<string, (typeof foods)[0]>();
    for (const food of foods) {
      foodMap.set(food.id, food);
    }

    // 3. Process each item deterministically
    const calculatedItems: PreviewItemResult[] = [];

    for (const item of items) {
      const foodId = item.foodId.trim();
      const food = foodMap.get(foodId);

      if (!food) {
        throw new NotFoundException(`Food with ID "${foodId}" not found in database`);
      }

      // Match unit conversion (case-insensitive and trimmed)
      const requestedUnit = item.unitName.trim().toLowerCase();
      const conversion = food.unitConversions?.find(
        (uc) => uc.unitName.trim().toLowerCase() === requestedUnit,
      );

      if (!conversion) {
        const availableUnits = (food.unitConversions || []).map((uc) => uc.unitName).join(', ');
        throw new BadRequestException(
          `Unit "${item.unitName}" is not valid for food "${food.name}". Available units: ${availableUnits || 'none'}`,
        );
      }

      if (!Number.isFinite(conversion.gramEquivalent) || conversion.gramEquivalent <= 0) {
        throw new BadRequestException(
          `Conversion factor for unit "${item.unitName}" on food "${food.name}" must be greater than zero`,
        );
      }

      // Calculate gram weight: quantity * gramEquivalent
      const totalGrams = item.quantity * conversion.gramEquivalent;
      const ratio = totalGrams / 100;

      // Authoritative nutrient calculation based on 100g database values
      const caloriesKcal = Math.round(food.caloriesKcal * ratio);
      const proteinG = Math.round(food.proteinG * ratio * 10) / 10;
      const carbohydratesG = Math.round(food.carbohydratesG * ratio * 10) / 10;
      const fatG = Math.round(food.fatG * ratio * 10) / 10;

      calculatedItems.push({
        foodId: food.id,
        name: food.name,
        quantity: item.quantity,
        unitName: conversion.unitName, // Preserve canonical casing from DB
        grams: Math.round(totalGrams * 10) / 10,
        caloriesKcal,
        proteinG,
        carbohydratesG,
        fatG,
        isVerified: food.isVerified,
      });
    }

    // 4. Calculate aggregated totals
    // Summing calculated items ensures the totals mathematically equal the sum of the items displayed
    const totalCaloriesKcal = calculatedItems.reduce((acc, curr) => acc + curr.caloriesKcal, 0);
    const totalProteinG =
      Math.round(calculatedItems.reduce((acc, curr) => acc + curr.proteinG, 0) * 10) / 10;
    const totalCarbohydratesG =
      Math.round(calculatedItems.reduce((acc, curr) => acc + curr.carbohydratesG, 0) * 10) / 10;
    const totalFatG =
      Math.round(calculatedItems.reduce((acc, curr) => acc + curr.fatG, 0) * 10) / 10;

    return {
      items: calculatedItems,
      totals: {
        caloriesKcal: totalCaloriesKcal,
        proteinG: totalProteinG,
        carbohydratesG: totalCarbohydratesG,
        fatG: totalFatG,
      },
    };
  }
}
