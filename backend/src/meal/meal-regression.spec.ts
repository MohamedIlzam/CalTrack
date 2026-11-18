import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MealService - Diary Persistence & Integrity Regressions', () => {
  let service: MealService;
  let mockPrisma: any;

  const testUserId = 'test-user-uuid';
  const testDate = '2026-11-18';
  let storedEntries: any[] = [];

  beforeEach(async () => {
    storedEntries = [];

    mockPrisma = {
      mealLog: {
        findUnique: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            id: 'meal-log-uuid',
            userId: testUserId,
            date: new Date('2026-11-18T00:00:00.000Z'),
            entries: storedEntries,
          });
        }),
        create: jest.fn().mockResolvedValue({
          id: 'meal-log-uuid',
          userId: testUserId,
          date: new Date('2026-11-18T00:00:00.000Z'),
          entries: [],
        }),
      },
      food: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id && !where.id.startsWith('ai-') && !where.id.startsWith('custom-')) {
            return Promise.resolve({ id: where.id, name: 'Known Food' });
          }
          return Promise.resolve(null);
        }),
      },
      mealLogEntry: {
        create: jest.fn().mockImplementation(({ data }) => {
          const entry = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            ...data,
            createdAt: new Date(),
          };
          storedEntries.push(entry);
          return Promise.resolve(entry);
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = storedEntries.findIndex((e) => e.id === where.id);
          if (idx !== -1) {
            storedEntries.splice(idx, 1);
          }
          return Promise.resolve({ id: where.id });
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const entry = storedEntries.find((e) => e.id === where.id);
          if (!entry) return Promise.resolve(null);
          return Promise.resolve({
            ...entry,
            mealLog: { userId: testUserId },
          });
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MealService>(MealService);
  });

  // Test 1: Add Food A to Breakfast; add Food B to Breakfast; both remain.
  it('Scenario 1: Adding Food A then Food B to Breakfast preserves both entries', async () => {
    const entryA = await service.logFood(testUserId, {
      date: testDate,
      foodId: 'food-a-id',
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: '1 hopper',
      loggedWeightGrams: 50,
      loggedCaloriesKcal: 120,
      loggedProteinG: 3,
      loggedCarbohydratesG: 22,
      loggedFatG: 2,
    });

    const entryB = await service.logFood(testUserId, {
      date: testDate,
      foodId: 'food-b-id',
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: '1 cup dhal',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 180,
      loggedProteinG: 9,
      loggedCarbohydratesG: 20,
      loggedFatG: 5,
    });

    expect(storedEntries).toHaveLength(2);
    expect(storedEntries.map((e) => e.id)).toEqual([entryA.id, entryB.id]);
    expect(storedEntries.every((e) => e.meal === 'BREAKFAST')).toBe(true);
  });

  // Test 2: Add Food C to Breakfast; all three remain.
  it('Scenario 2: Adding Food C to Breakfast preserves all 3 items', async () => {
    await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Food A',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 100,
      loggedProteinG: 2,
      loggedCarbohydratesG: 20,
      loggedFatG: 1,
    });

    await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Food B',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 150,
      loggedProteinG: 5,
      loggedCarbohydratesG: 25,
      loggedFatG: 3,
    });

    await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Food C',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 200,
      loggedProteinG: 8,
      loggedCarbohydratesG: 30,
      loggedFatG: 5,
    });

    expect(storedEntries).toHaveLength(3);
    expect(storedEntries.map((e) => e.unitName)).toEqual(['Food A', 'Food B', 'Food C']);
  });

  // Test 3: Breakfast entries are not affected by adding Lunch.
  it('Scenario 3: Adding Lunch does not affect Breakfast entries', async () => {
    await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Breakfast Food',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 150,
      loggedProteinG: 4,
      loggedCarbohydratesG: 25,
      loggedFatG: 3,
    });

    await service.logFood(testUserId, {
      date: testDate,
      meal: 'LUNCH',
      servingQuantity: 1,
      unitName: 'Lunch Food',
      loggedWeightGrams: 250,
      loggedCaloriesKcal: 450,
      loggedProteinG: 20,
      loggedCarbohydratesG: 60,
      loggedFatG: 12,
    });

    expect(storedEntries).toHaveLength(2);
    const breakfast = storedEntries.filter((e) => e.meal === 'BREAKFAST');
    const lunch = storedEntries.filter((e) => e.meal === 'LUNCH');
    expect(breakfast).toHaveLength(1);
    expect(lunch).toHaveLength(1);
    expect(breakfast[0].unitName).toBe('Breakfast Food');
    expect(lunch[0].unitName).toBe('Lunch Food');
  });

  // Test 4: A standard food followed by an AI-estimated food preserves both.
  it('Scenario 4: Standard food followed by AI-estimated food preserves both', async () => {
    // Standard food with valid foodId in DB
    const std = await service.logFood(testUserId, {
      date: testDate,
      foodId: 'known-food-uuid',
      meal: 'DINNER',
      servingQuantity: 1,
      unitName: 'Red Rice',
      loggedWeightGrams: 150,
      loggedCaloriesKcal: 180,
      loggedProteinG: 4,
      loggedCarbohydratesG: 40,
      loggedFatG: 1,
    });

    // AI-estimated food with custom/ai synthetic id
    const aiFood = await service.logFood(testUserId, {
      date: testDate,
      foodId: 'ai-prompt-estimate-12345',
      meal: 'DINNER',
      servingQuantity: 1,
      unitName: JSON.stringify({ name: 'Homemade Curry', ingredients: [] }),
      loggedWeightGrams: 120,
      loggedCaloriesKcal: 220,
      loggedProteinG: 10,
      loggedCarbohydratesG: 15,
      loggedFatG: 8,
    });

    expect(storedEntries).toHaveLength(2);
    expect(std.foodId).toBe('known-food-uuid');
    expect(aiFood.foodId).toBeNull(); // foreign key safety
    expect(storedEntries[0].id).toBe(std.id);
    expect(storedEntries[1].id).toBe(aiFood.id);
  });

  // Test 5: Refresh/reload returns the complete diary.
  it('Scenario 5: Calling getDailyLog returns all persisted entries intact', async () => {
    await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Dish 1',
      loggedWeightGrams: 100,
      loggedCaloriesKcal: 100,
      loggedProteinG: 5,
      loggedCarbohydratesG: 15,
      loggedFatG: 2,
    });

    await service.logFood(testUserId, {
      date: testDate,
      meal: 'LUNCH',
      servingQuantity: 1,
      unitName: 'Dish 2',
      loggedWeightGrams: 200,
      loggedCaloriesKcal: 300,
      loggedProteinG: 15,
      loggedCarbohydratesG: 45,
      loggedFatG: 6,
    });

    const refreshedDiary = await service.getDailyLog(testUserId, testDate);
    expect(refreshedDiary.entries).toHaveLength(2);
    expect(refreshedDiary.entries.map((e) => e.unitName)).toEqual(['Dish 1', 'Dish 2']);
  });

  // Test 6: Deleting one entry does not delete others.
  it('Scenario 6: Deleting an entry removes only that entry and preserves all other entries', async () => {
    const e1 = await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Entry 1',
      loggedWeightGrams: 50,
      loggedCaloriesKcal: 100,
      loggedProteinG: 2,
      loggedCarbohydratesG: 15,
      loggedFatG: 1,
    });

    const e2 = await service.logFood(testUserId, {
      date: testDate,
      meal: 'BREAKFAST',
      servingQuantity: 1,
      unitName: 'Entry 2',
      loggedWeightGrams: 50,
      loggedCaloriesKcal: 120,
      loggedProteinG: 3,
      loggedCarbohydratesG: 20,
      loggedFatG: 2,
    });

    expect(storedEntries).toHaveLength(2);

    await service.deleteEntry(testUserId, e1.id);

    expect(storedEntries).toHaveLength(1);
    expect(storedEntries[0].id).toBe(e2.id);
  });

  // Test 10: Multiple concurrent save attempts cannot overwrite earlier entries.
  it('Scenario 10: Concurrent save requests append safely without collision', async () => {
    const promises = [1, 2, 3, 4, 5].map((i) =>
      service.logFood(testUserId, {
        date: testDate,
        meal: 'SNACKS',
        servingQuantity: 1,
        unitName: `Concurrent Snack ${i}`,
        loggedWeightGrams: 50,
        loggedCaloriesKcal: 80,
        loggedProteinG: 2,
        loggedCarbohydratesG: 12,
        loggedFatG: 2,
      }),
    );

    await Promise.all(promises);

    expect(storedEntries).toHaveLength(5);
    const names = storedEntries.map((e) => e.unitName);
    for (let i = 1; i <= 5; i++) {
      expect(names).toContain(`Concurrent Snack ${i}`);
    }
  });
});
