import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NutritionToolsService } from './nutrition-tools.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DiarySummaryService } from '../diary-summary.service';
import { parseLocalDate } from '../../common/date.util';

describe('NutritionToolsService (CIE Read-Only Nutrition Foundation)', () => {
  let service: NutritionToolsService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create?: jest.Mock;
      update?: jest.Mock;
    };
    mealLog: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create?: jest.Mock;
      update?: jest.Mock;
    };
    food: { findMany: jest.Mock };
    weightEntry: { findMany: jest.Mock };
  };
  let diarySummaryService: DiarySummaryService;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      mealLog: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      food: { findMany: jest.fn() },
      weightEntry: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionToolsService,
        DiarySummaryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NutritionToolsService>(NutritionToolsService);
    diarySummaryService = module.get<DiarySummaryService>(DiarySummaryService);
  });

  describe('Expanded bounded read-only tools', () => {
    it('looks up catalog nutrition and converts per-100g values to the standard serving', async () => {
      prisma.food.findMany.mockResolvedValue([{
        id: 'food-1', name: 'Prawn Kottu', category: 'Rice & Bread', isVerified: true,
        caloriesKcal: 200, proteinG: 10, carbohydratesG: 25, fatG: 6,
        unitConversions: [{ unitName: 'plate', gramEquivalent: 300, isStandard: true }],
      }]);
      const result = await service.lookupFoods('user-a', { query: 'prawn kottu' });
      expect(result.foods[0]).toEqual(expect.objectContaining({ name: 'Prawn Kottu', calories: 600, protein: 30, servingDescription: '1 plate' }));
      expect(prisma.food.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    });

    it('isolates weight progress by authenticated user identity', async () => {
      prisma.weightEntry.findMany.mockResolvedValue([
        { recordedAt: new Date('2026-10-01T00:00:00Z'), weightKg: 70 },
        { recordedAt: new Date('2026-11-01T00:00:00Z'), weightKg: 68.5 },
      ]);
      const result = await service.getWeightProgress('user-alpha', { days: 90 });
      expect(result.changeKg).toBe(-1.5);
      expect(prisma.weightEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 'user-alpha' }) }));
    });
  });

  // ---------------------------------------------------------------------------
  // 1. Daily Meal Retrieval Returns Correct Food Names & Totals
  // ---------------------------------------------------------------------------
  describe('Tool 1: getDailyNutrition', () => {
    it('1. Daily meal retrieval returns the correct food names and totals', async () => {
      const targetDate = '2026-11-20';
      const utcDate = parseLocalDate(targetDate);

      const mockEntries = [
        {
          id: 'e1',
          meal: 'BREAKFAST',
          servingQuantity: 2,
          unitName: 'piece',
          loggedCaloriesKcal: 320,
          loggedProteinG: 16,
          loggedCarbohydratesG: 36,
          loggedFatG: 12,
          food: { id: 'f1', name: 'Egg Hopper' },
        },
        {
          id: 'e2',
          meal: 'LUNCH',
          servingQuantity: 1,
          unitName: JSON.stringify({ name: 'Sri Lankan Rice & Curry Plate', ingredients: ['Rice', 'Dhal', 'Chicken'] }),
          loggedCaloriesKcal: 650,
          loggedProteinG: 42,
          loggedCarbohydratesG: 78,
          loggedFatG: 18,
          food: null,
        },
      ];

      prisma.mealLog.findUnique.mockResolvedValue({
        id: 'log-1',
        userId: 'user-alpha',
        date: utcDate,
        entries: mockEntries,
      });

      const result = await service.getDailyNutrition('user-alpha', { date: targetDate });

      expect(result.date).toBe('2026-11-20');
      expect(result.isLogged).toBe(true);
      expect(result.totalCalories).toBe(970);
      expect(result.totalProtein).toBe(58);
      expect(result.totalCarbs).toBe(114);
      expect(result.totalFat).toBe(30);

      // Verify grouped meals
      expect(result.meals.length).toBe(2);

      const breakfast = result.meals.find((m) => m.slot === 'Breakfast');
      expect(breakfast).toBeDefined();
      expect(breakfast?.slotCalories).toBe(320);
      expect(breakfast?.items[0].name).toBe('Egg Hopper');
      expect(breakfast?.items[0].calories).toBe(320);

      const lunch = result.meals.find((m) => m.slot === 'Lunch');
      expect(lunch).toBeDefined();
      expect(lunch?.slotCalories).toBe(650);
      expect(lunch?.items[0].name).toBe('Sri Lankan Rice & Curry Plate');
    });

    // ---------------------------------------------------------------------------
    // 2. No-log Days Are Distinguished from Recorded Meals
    // ---------------------------------------------------------------------------
    it('2. No-log days are distinguished from days with recorded meals (null log)', async () => {
      prisma.mealLog.findUnique.mockResolvedValue(null);

      const result = await service.getDailyNutrition('user-alpha', { date: '2026-11-19' });

      expect(result.date).toBe('2026-11-19');
      expect(result.isLogged).toBe(false);
      expect(result.totalCalories).toBe(0);
      expect(result.totalProtein).toBe(0);
      expect(result.totalCarbs).toBe(0);
      expect(result.totalFat).toBe(0);
      expect(result.meals).toEqual([]);
    });

    it('2b. No-log days are distinguished when MealLog has empty entries: []', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({
        id: 'empty-log',
        userId: 'user-alpha',
        date: parseLocalDate('2026-11-19'),
        entries: [],
      });

      const result = await service.getDailyNutrition('user-alpha', { date: '2026-11-19' });

      expect(result.isLogged).toBe(false);
      expect(result.totalCalories).toBe(0);
      expect(result.meals).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Saved User Targets are Retrieved Correctly & Exclude Private Data
  // ---------------------------------------------------------------------------
  describe('Tool 2: getNutritionTargets', () => {
    it('3. Saved user targets are retrieved correctly and do not expose private credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-alpha',
        email: 'private@caltrack.app',
        passwordHash: '$2b$10$secret_hash_value',
        targetCalories: 2150,
        targetProteinG: 135,
        targetCarbsG: 240,
        targetFatG: 65,
        goal: 'MAINTAIN',
        weightKg: 68.5,
        targetWeightKg: 68.0,
        heightCm: 172,
        activityLevel: 'MODERATE',
      });

      const targets = await service.getNutritionTargets('user-alpha');

      expect(targets.targetCalories).toBe(2150);
      expect(targets.targetProteinG).toBe(135);
      expect(targets.targetCarbsG).toBe(240);
      expect(targets.targetFatG).toBe(65);
      expect(targets.goal).toBe('MAINTAIN');
      expect(targets.currentWeightKg).toBe(68.5);
      expect(targets.targetWeightKg).toBe(68.0);
      expect(targets.heightCm).toBe(172);
      expect(targets.activityLevel).toBe('MODERATE');

      // Crucial privacy verification: No password hash or email exposed in return object
      expect((targets as any).passwordHash).toBeUndefined();
      expect((targets as any).email).toBeUndefined();
      expect((targets as any).id).toBeUndefined();
    });

    it('throws NotFoundException if user profile does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getNutritionTargets('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Seven-Day History Uses Correct Date Range
  // ---------------------------------------------------------------------------
  describe('Tool 3: getFoodHistory', () => {
    it('4. Seven-day history uses the correct date range and calculates averages across logged days only', async () => {
      const endDate = '2026-11-20';
      const endDateUtc = parseLocalDate(endDate);

      // Simulate 3 logged days out of 7 days
      const mockLogs = [
        {
          id: 'log-1',
          date: parseLocalDate('2026-11-15'),
          entries: [
            {
              loggedCaloriesKcal: 1800,
              loggedProteinG: 120,
              loggedCarbohydratesG: 200,
              loggedFatG: 55,
              food: { name: 'Dhal Curry' },
              unitName: 'cup',
            },
          ],
        },
        {
          id: 'log-2',
          date: parseLocalDate('2026-11-18'),
          entries: [
            {
              loggedCaloriesKcal: 2000,
              loggedProteinG: 130,
              loggedCarbohydratesG: 220,
              loggedFatG: 65,
              food: { name: 'Chicken Curry' },
              unitName: 'portion',
            },
          ],
        },
        {
          id: 'log-3',
          date: endDateUtc, // 2026-11-20
          entries: [
            {
              loggedCaloriesKcal: 1600,
              loggedProteinG: 110,
              loggedCarbohydratesG: 180,
              loggedFatG: 50,
              food: { name: 'Egg Hopper' },
              unitName: 'piece',
            },
          ],
        },
      ];

      prisma.mealLog.findMany.mockResolvedValue(mockLogs);

      const history = await service.getFoodHistory('user-alpha', { days: 7, endDate });

      expect(history.daysRequested).toBe(7);
      expect(history.startDate).toBe('2026-11-14');
      expect(history.endDate).toBe('2026-11-20');
      expect(history.dailyEntries.length).toBe(7);
      expect(history.loggedDaysCount).toBe(3);
      expect(history.unloggedDaysCount).toBe(4);

      // Average must be (1800 + 2000 + 1600) / 3 = 1800 kcal (NOT divided by 7)
      expect(history.avgDailyCalories).toBe(1800);
      expect(history.avgDailyProtein).toBe(120);

      // Verify chronological daily entries
      expect(history.dailyEntries[0].date).toBe('2026-11-14');
      expect(history.dailyEntries[0].isLogged).toBe(false);

      const dayNov20 = history.dailyEntries.find((d) => d.date === '2026-11-20');
      expect(dayNov20?.isLogged).toBe(true);
      expect(dayNov20?.calories).toBe(1600);
      expect(dayNov20?.foods).toContain('Egg Hopper');
    });

    it('returns null for averages when all days in history are unlogged', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);

      const history = await service.getFoodHistory('user-alpha', { days: 7, endDate: '2026-11-20' });

      expect(history.loggedDaysCount).toBe(0);
      expect(history.unloggedDaysCount).toBe(7);
      expect(history.avgDailyCalories).toBeNull();
      expect(history.avgDailyProtein).toBeNull();
      expect(history.avgDailyCarbs).toBeNull();
      expect(history.avgDailyFat).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Invalid Dates & Out-of-Range Requests are Rejected
  // ---------------------------------------------------------------------------
  describe('Input Validation & Boundary Checking', () => {
    it('5a. Invalid date formats and non-existent calendar dates are rejected with BadRequestException', async () => {
      // Missing or non-string date
      await expect(service.getDailyNutrition('user-alpha', { date: '' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyNutrition('user-alpha', { date: 'invalid-date' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyNutrition('user-alpha', { date: '2026/11/20' })).rejects.toThrow(
        BadRequestException,
      );

      // Non-existent calendar dates (e.g. Feb 31, Month 13)
      await expect(service.getDailyNutrition('user-alpha', { date: '2026-02-31' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyNutrition('user-alpha', { date: '2026-13-01' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyNutrition('user-alpha', { date: '2026-04-31' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('5b. History days limit must be an integer between 1 and 30 for bounded V1 summaries', async () => {
      // Out of bounds (< 1 or > 30)
      await expect(service.getFoodHistory('user-alpha', { days: 0 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getFoodHistory('user-alpha', { days: -5 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getFoodHistory('user-alpha', { days: 31 })).rejects.toThrow(
        BadRequestException,
      );

      // Non-integer days
      await expect(service.getFoodHistory('user-alpha', { days: 3.5 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getFoodHistory('user-alpha', { days: NaN as any })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('5c. Missing or invalid authenticated userId is rejected with UnauthorizedException', async () => {
      await expect(service.getDailyNutrition('', { date: '2026-11-20' })).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getNutritionTargets('   ')).rejects.toThrow(UnauthorizedException);
      await expect(service.getFoodHistory(null as any, { days: 7 })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 6. User Isolation: User A Cannot Retrieve User B's Data
  // ---------------------------------------------------------------------------
  describe('User Isolation & Data Boundary Security', () => {
    it('6. Queries are strictly scoped to the authenticated server-side userId', async () => {
      const userA = 'user-alice-123';
      const userB = 'user-bob-456';

      prisma.mealLog.findUnique.mockImplementation(({ where }) => {
        if (where.userId_date.userId === userA) {
          return Promise.resolve({
            id: 'log-alice',
            userId: userA,
            entries: [
              {
                loggedCaloriesKcal: 400,
                loggedProteinG: 20,
                loggedCarbohydratesG: 40,
                loggedFatG: 10,
                food: { name: 'Alice Healthy Salad' },
                unitName: 'bowl',
              },
            ],
          });
        }
        return Promise.resolve(null);
      });

      // User A querying their own data
      const aliceResult = await service.getDailyNutrition(userA, { date: '2026-11-20' });
      expect(aliceResult.isLogged).toBe(true);
      expect(aliceResult.totalCalories).toBe(400);
      expect(aliceResult.meals[0].items[0].name).toBe('Alice Healthy Salad');

      // User B querying the same date has no access to User A's log
      const bobResult = await service.getDailyNutrition(userB, { date: '2026-11-20' });
      expect(bobResult.isLogged).toBe(false);
      expect(bobResult.totalCalories).toBe(0);
      expect(bobResult.meals).toEqual([]);

      // Verify Prisma compound index was invoked with exact userId
      expect(prisma.mealLog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_date: expect.objectContaining({ userId: userB }),
          }),
        }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 7. All Tools are Strictly Read-Only
  // ---------------------------------------------------------------------------
  describe('Read-Only Guarantee', () => {
    it('7. No database mutations (create, update, delete, upsert) are performed during tool calls', async () => {
      prisma.mealLog.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-alpha',
        targetCalories: 2000,
        targetProteinG: 120,
        targetCarbsG: 220,
        targetFatG: 60,
      });
      prisma.mealLog.findMany.mockResolvedValue([]);

      await service.getDailyNutrition('user-alpha', { date: '2026-11-20' });
      await service.getNutritionTargets('user-alpha');
      await service.getFoodHistory('user-alpha', { days: 7, endDate: '2026-11-20' });

      // Mutating functions on prisma must never have been called or defined
      expect((prisma as any).mealLog.create).toBeUndefined();
      expect((prisma as any).mealLog.update).toBeUndefined();
      expect((prisma as any).user.update).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Existing Diary and Calculations Consistency
  // ---------------------------------------------------------------------------
  describe('Calculation Parity with Existing Diary Services', () => {
    it('8. Food name extraction safely handles custom combo JSON and verified catalog foods', () => {
      // 1. Catalog verified food
      const catalogEntry = {
        food: { name: 'Kottu Roti' },
        unitName: 'plate',
      };
      expect(diarySummaryService.extractFoodName(catalogEntry)).toBe('Kottu Roti');

      // 2. Custom JSON combo entry
      const comboEntry = {
        food: null,
        unitName: JSON.stringify({
          name: 'String Hoppers with Kiri Hodi & Sambol',
          ingredients: ['String Hoppers', 'Kiri Hodi', 'Pol Sambol'],
        }),
      };
      expect(diarySummaryService.extractFoodName(comboEntry)).toBe(
        'String Hoppers with Kiri Hodi & Sambol',
      );

      // 3. Fallback unitName food entry
      const fallbackEntry = {
        food: null,
        unitName: 'Pol Roti',
      };
      expect(diarySummaryService.extractFoodName(fallbackEntry)).toBe('Pol Roti');
    });
  });
});
