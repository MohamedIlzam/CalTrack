import { Test, TestingModule } from '@nestjs/testing';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('NutritionCalculatorService - Authoritative Nutrition Calculation', () => {
  let service: NutritionCalculatorService;
  let mockPrisma: any;

  // Standard Sri Lankan food fixtures matching realistic database records (nutrients per 100g)
  // Egg Hopper: 85g per piece = 160 kcal, 8g protein, 18g carbs, 6g fat
  const eggHopperFood = {
    id: 'food-egg-hopper-uuid',
    name: 'Egg Hopper',
    category: 'Rice & Bread',
    isVerified: true,
    caloriesKcal: 188.235, // per 100g (160 kcal for 85g)
    proteinG: 9.412,       // per 100g (8g P for 85g)
    carbohydratesG: 21.176,// per 100g (18g C for 85g)
    fatG: 7.059,           // per 100g (6g F for 85g)
    unitConversions: [
      { id: 'uc-1', foodId: 'food-egg-hopper-uuid', unitName: 'piece', gramEquivalent: 85, isStandard: true },
    ],
  };

  // Dhal Curry: 150g per cup = 180 kcal, 9g protein, 25g carbs, 5g fat
  const dhalCurryFood = {
    id: 'food-dhal-curry-uuid',
    name: 'Dhal Curry',
    category: 'Curries',
    isVerified: true,
    caloriesKcal: 120.0,   // per 100g (180 kcal for 150g)
    proteinG: 6.0,         // per 100g (9g P for 150g)
    carbohydratesG: 16.667,// per 100g (25g C for 150g)
    fatG: 3.333,           // per 100g (5g F for 150g)
    unitConversions: [
      { id: 'uc-2', foodId: 'food-dhal-curry-uuid', unitName: 'cup', gramEquivalent: 150, isStandard: true },
      { id: 'uc-3', foodId: 'food-dhal-curry-uuid', unitName: 'tablespoon', gramEquivalent: 15, isStandard: false },
    ],
  };

  const corruptedFood = {
    id: 'food-corrupted-uuid',
    name: 'Corrupted Food',
    category: 'Extras',
    isVerified: false,
    caloriesKcal: 100,
    proteinG: 5,
    carbohydratesG: 10,
    fatG: 2,
    unitConversions: [
      { id: 'uc-4', foodId: 'food-corrupted-uuid', unitName: 'zero-unit', gramEquivalent: 0, isStandard: false },
      { id: 'uc-5', foodId: 'food-corrupted-uuid', unitName: 'neg-unit', gramEquivalent: -50, isStandard: false },
    ],
  };

  const allFoods = [eggHopperFood, dhalCurryFood, corruptedFood];

  beforeEach(async () => {
    mockPrisma = {
      food: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const ids: string[] = where?.id?.in || [];
          const matches = allFoods.filter((f) => ids.includes(f.id));
          return Promise.resolve(matches);
        }),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      mealLog: {
        create: jest.fn(),
        update: jest.fn(),
      },
      mealLogEntry: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionCalculatorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NutritionCalculatorService>(NutritionCalculatorService);
  });

  // Test 1: Known food and known serving conversion
  it('1. Known food and known serving conversion calculates exact authoritative values', async () => {
    const result = await service.calculateMeal({
      items: [
        {
          foodId: eggHopperFood.id,
          quantity: 1,
          unitName: 'piece',
        },
      ],
    });

    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.foodId).toBe(eggHopperFood.id);
    expect(item.name).toBe('Egg Hopper');
    expect(item.quantity).toBe(1);
    expect(item.unitName).toBe('piece');
    expect(item.grams).toBe(85);
    expect(item.caloriesKcal).toBe(160);
    expect(item.proteinG).toBe(8);
    expect(item.carbohydratesG).toBe(18);
    expect(item.fatG).toBe(6);
    expect(item.isVerified).toBe(true);

    expect(result.totals.caloriesKcal).toBe(160);
    expect(result.totals.proteinG).toBe(8);
    expect(result.totals.carbohydratesG).toBe(18);
    expect(result.totals.fatG).toBe(6);
  });

  // Test 2: Half serving
  it('2. Half serving (0.5 quantity) returns exactly half the grams and macros', async () => {
    const result = await service.calculateMeal({
      items: [
        {
          foodId: eggHopperFood.id,
          quantity: 0.5,
          unitName: 'piece',
        },
      ],
    });

    const item = result.items[0];
    expect(item.grams).toBe(42.5);
    expect(item.caloriesKcal).toBe(80);
    expect(item.proteinG).toBe(4);
    expect(item.carbohydratesG).toBe(9);
    expect(item.fatG).toBe(3);

    expect(result.totals.caloriesKcal).toBe(80);
    expect(result.totals.proteinG).toBe(4);
    expect(result.totals.carbohydratesG).toBe(9);
    expect(result.totals.fatG).toBe(3);
  });

  // Test 3: Double serving
  it('3. Double serving (2.0 quantity) returns double grams and macros', async () => {
    const result = await service.calculateMeal({
      items: [
        {
          foodId: eggHopperFood.id,
          quantity: 2,
          unitName: 'piece',
        },
      ],
    });

    const item = result.items[0];
    expect(item.grams).toBe(170);
    expect(item.caloriesKcal).toBe(320);
    expect(item.proteinG).toBe(16);
    expect(item.carbohydratesG).toBe(36);
    expect(item.fatG).toBe(12);

    expect(result.totals.caloriesKcal).toBe(320);
    expect(result.totals.proteinG).toBe(16);
  });

  // Test 4: Multiple items with aggregated totals
  it('4. Multiple items calculates individual breakdowns and mathematically consistent totals', async () => {
    const result = await service.calculateMeal({
      items: [
        { foodId: eggHopperFood.id, quantity: 1, unitName: 'piece' },
        { foodId: dhalCurryFood.id, quantity: 1, unitName: 'cup' },
      ],
    });

    expect(result.items).toHaveLength(2);
    const hopper = result.items[0];
    const dhal = result.items[1];

    expect(hopper.caloriesKcal).toBe(160);
    expect(hopper.proteinG).toBe(8);
    expect(hopper.carbohydratesG).toBe(18);
    expect(hopper.fatG).toBe(6);

    expect(dhal.grams).toBe(150);
    expect(dhal.caloriesKcal).toBe(180);
    expect(dhal.proteinG).toBe(9);
    expect(dhal.carbohydratesG).toBe(25);
    expect(dhal.fatG).toBe(5);

    // Totals must equal sum of item values
    expect(result.totals.caloriesKcal).toBe(340);
    expect(result.totals.proteinG).toBe(17);
    expect(result.totals.carbohydratesG).toBe(43);
    expect(result.totals.fatG).toBe(11);
  });

  // Test 5: Incorrect unit for a valid food
  it('5. Incorrect unit for a valid food throws BadRequestException with available units', async () => {
    await expect(
      service.calculateMeal({
        items: [
          {
            foodId: eggHopperFood.id,
            quantity: 1,
            unitName: 'bucket',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);

    try {
      await service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: 1, unitName: 'bucket' }],
      });
    } catch (err: any) {
      expect(err.message).toContain('Unit "bucket" is not valid for food "Egg Hopper"');
      expect(err.message).toContain('Available units: piece');
    }
  });

  // Test 6: Unknown food ID
  it('6. Unknown food ID throws NotFoundException', async () => {
    await expect(
      service.calculateMeal({
        items: [
          {
            foodId: 'non-existent-food-uuid',
            quantity: 1,
            unitName: 'piece',
          },
        ],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 7: Invalid quantities including NaN, Infinity, negative, zero, and extreme values
  it('7. Invalid quantities (NaN, Infinity, negative, zero, >100) throw BadRequestException', async () => {
    // NaN
    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: NaN, unitName: 'piece' }],
      }),
    ).rejects.toThrow(BadRequestException);

    // Infinity
    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: Infinity, unitName: 'piece' }],
      }),
    ).rejects.toThrow(BadRequestException);

    // Zero
    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: 0, unitName: 'piece' }],
      }),
    ).rejects.toThrow(BadRequestException);

    // Negative
    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: -2, unitName: 'piece' }],
      }),
    ).rejects.toThrow(BadRequestException);

    // Exceeds max 100
    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: 150, unitName: 'piece' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 8: Zero or negative conversions
  it('8. Zero or negative gramEquivalent in database conversion throws BadRequestException', async () => {
    await expect(
      service.calculateMeal({
        items: [{ foodId: corruptedFood.id, quantity: 1, unitName: 'zero-unit' }],
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.calculateMeal({
        items: [{ foodId: corruptedFood.id, quantity: 1, unitName: 'neg-unit' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 9: Client supplying fake calorie totals
  it('9. Client supplying fake calorie totals has them completely ignored by the authoritative backend', async () => {
    const untrustedPayload: any = {
      items: [
        {
          foodId: eggHopperFood.id,
          quantity: 1,
          unitName: 'piece',
          fakeCaloriesKcal: 999999,
          caloriesKcal: 0,
          proteinG: 500,
        },
      ],
      fakeTotals: {
        caloriesKcal: 1,
      },
    };

    const result = await service.calculateMeal(untrustedPayload);

    // Must be real authoritative 160 kcal, NOT 999999 or 0
    expect(result.items[0].caloriesKcal).toBe(160);
    expect(result.items[0].proteinG).toBe(8);
    expect(result.totals.caloriesKcal).toBe(160);
    expect((result as any).fakeTotals).toBeUndefined();
  });

  // Test 10: Validation of empty or malformed requests
  it('10. Empty items array or malformed body throws BadRequestException', async () => {
    await expect(service.calculateMeal({ items: [] })).rejects.toThrow(BadRequestException);
    await expect(service.calculateMeal(null as any)).rejects.toThrow(BadRequestException);
    await expect(service.calculateMeal({} as any)).rejects.toThrow(BadRequestException);
  });

  // Test 11: Database lookup failure fails closed without fabricating numbers
  it('11. Database lookup failure throws error and never fabricates fallback data', async () => {
    mockPrisma.food.findMany.mockRejectedValueOnce(new Error('PostgreSQL connection timeout'));

    await expect(
      service.calculateMeal({
        items: [{ foodId: eggHopperFood.id, quantity: 1, unitName: 'piece' }],
      }),
    ).rejects.toThrow('PostgreSQL connection timeout');
  });

  // Test 12: No database mutation during preview
  it('12. No database write/mutation methods are called during calculation', async () => {
    await service.calculateMeal({
      items: [
        { foodId: eggHopperFood.id, quantity: 1, unitName: 'piece' },
        { foodId: dhalCurryFood.id, quantity: 1, unitName: 'cup' },
      ],
    });

    expect(mockPrisma.food.create).not.toHaveBeenCalled();
    expect(mockPrisma.food.update).not.toHaveBeenCalled();
    expect(mockPrisma.food.delete).not.toHaveBeenCalled();
    expect(mockPrisma.mealLog.create).not.toHaveBeenCalled();
    expect(mockPrisma.mealLog.update).not.toHaveBeenCalled();
    expect(mockPrisma.mealLogEntry.create).not.toHaveBeenCalled();
    expect(mockPrisma.mealLogEntry.update).not.toHaveBeenCalled();
    expect(mockPrisma.mealLogEntry.delete).not.toHaveBeenCalled();
  });
});
