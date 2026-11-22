import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { NutritionCalculatorService } from '../food/nutrition-calculator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MealController - POST /meal/preview', () => {
  let controller: MealController;
  let mockCalculator: any;
  let mockMealService: any;

  beforeEach(async () => {
    mockCalculator = {
      calculateMeal: jest.fn().mockImplementation((dto) => {
        if (!dto || !dto.items || dto.items.length === 0) {
          throw new BadRequestException('The "items" array must contain at least one food item');
        }
        if (dto.items.some((i: any) => i.foodId === 'unknown-id')) {
          throw new NotFoundException('Food with ID "unknown-id" not found in database');
        }
        return Promise.resolve({
          items: [
            {
              foodId: 'food-uuid-1',
              name: 'Egg Hopper',
              quantity: 1,
              unitName: 'piece',
              grams: 85,
              caloriesKcal: 160,
              proteinG: 8,
              carbohydratesG: 18,
              fatG: 6,
              isVerified: true,
            },
          ],
          totals: {
            caloriesKcal: 160,
            proteinG: 8,
            carbohydratesG: 18,
            fatG: 6,
          },
        });
      }),
    };

    mockMealService = {
      getDailyLog: jest.fn(),
      logFood: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        { provide: MealService, useValue: mockMealService },
        { provide: NutritionCalculatorService, useValue: mockCalculator },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MealController>(MealController);
  });

  it('Guarded by JwtAuthGuard at class level', () => {
    const guards = Reflect.getMetadata('__guards__', MealController);
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThan(0);
    expect(guards[0]).toBe(JwtAuthGuard);
  });

  it('Returns authoritative items breakdown and totals from NutritionCalculatorService', async () => {
    const payload = {
      items: [{ foodId: 'food-uuid-1', quantity: 1, unitName: 'piece' }],
    };

    const result = await controller.previewMeal(payload);

    expect(mockCalculator.calculateMeal).toHaveBeenCalledWith(payload);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Egg Hopper');
    expect(result.items[0].caloriesKcal).toBe(160);
    expect(result.totals.caloriesKcal).toBe(160);
    expect(result.totals.proteinG).toBe(8);
  });

  it('Propagates NotFoundException when foodId is unknown', async () => {
    await expect(
      controller.previewMeal({
        items: [{ foodId: 'unknown-id', quantity: 1, unitName: 'piece' }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('Propagates BadRequestException when payload is empty or invalid', async () => {
    await expect(controller.previewMeal({ items: [] })).rejects.toThrow(BadRequestException);
  });
});
