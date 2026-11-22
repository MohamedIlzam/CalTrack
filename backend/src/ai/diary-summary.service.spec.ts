import { Test, TestingModule } from '@nestjs/testing';
import { DiarySummaryService } from './diary-summary.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DiarySummaryService', () => {
  let service: DiarySummaryService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      mealLog: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiarySummaryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DiarySummaryService>(DiarySummaryService);
  });

  describe('isTodayDiaryQuery', () => {
    it('should identify today meal and food queries', () => {
      expect(service.isTodayDiaryQuery('What did I have today?')).toBe(true);
      expect(service.isTodayDiaryQuery('what did i eat today')).toBe(true);
      expect(service.isTodayDiaryQuery('what have i eaten today')).toBe(true);
      expect(service.isTodayDiaryQuery('Show my meals today')).toBe(true);
      expect(service.isTodayDiaryQuery('tell me what i ate today')).toBe(true);
      expect(service.isTodayDiaryQuery('What are my meals today?')).toBe(true);
      expect(service.isTodayDiaryQuery('what did i log today')).toBe(true);
    });

    it('should identify intake, calories, and macros queries', () => {
      expect(service.isTodayDiaryQuery('How much food have I eaten today?')).toBe(true);
      expect(service.isTodayDiaryQuery('How much food have I ate today?')).toBe(true);
      expect(service.isTodayDiaryQuery('How many calories did I eat today?')).toBe(true);
      expect(service.isTodayDiaryQuery('How much protein did I eat today?')).toBe(true);
      expect(service.isTodayDiaryQuery('What is my total intake?')).toBe(true);
      expect(service.isTodayDiaryQuery('What is my total intake today?')).toBe(true);
      expect(service.isTodayDiaryQuery('How many calories and macros have I consumed today?')).toBe(true);
      expect(service.isTodayDiaryQuery('how many calories have i consumed today')).toBe(true);
      expect(service.isTodayDiaryQuery('how are my macros today')).toBe(true);
      expect(service.isTodayDiaryQuery('how much protein have i eaten today')).toBe(true);
      expect(service.isTodayDiaryQuery('total intake today')).toBe(true);
    });

    it('should identify remaining calorie queries', () => {
      expect(service.isTodayDiaryQuery('how many calories do i have left')).toBe(true);
      expect(service.isTodayDiaryQuery('calories remaining')).toBe(true);
      expect(service.isTodayDiaryQuery('how much more can i eat today')).toBe(true);
    });

    it('should NOT intercept future recommendations or general coaching queries', () => {
      expect(service.isTodayDiaryQuery('What should I eat today?')).toBe(false);
      expect(service.isTodayDiaryQuery('what should i eat for dinner')).toBe(false);
      expect(service.isTodayDiaryQuery('Should I eat carbs before a workout?')).toBe(false);
      expect(service.isTodayDiaryQuery('Suggest a high protein snack')).toBe(false);
      expect(service.isTodayDiaryQuery('Can I eat an egg hopper on keto?')).toBe(false);
      expect(service.isTodayDiaryQuery('Is dhal curry good for weight loss?')).toBe(false);
    });
  });

  describe('isHistoricalDiaryQuery', () => {
    it('should identify queries asking about past dates', () => {
      expect(service.isHistoricalDiaryQuery('What did I eat yesterday?')).toBe(true);
      expect(service.isHistoricalDiaryQuery('How many calories did I eat last week?')).toBe(true);
      expect(service.isHistoricalDiaryQuery('What meals did I log last Monday?')).toBe(true);
    });

    it('should return false for today queries', () => {
      expect(service.isHistoricalDiaryQuery('What did I eat today?')).toBe(false);
    });
  });

  describe('extractFoodName & extractServingDescription', () => {
    it('should extract name from entry with linked Food record', () => {
      const entry = {
        food: { name: 'Egg Hopper' },
        unitName: 'piece',
        servingQuantity: 2,
      };
      expect(service.extractFoodName(entry)).toBe('Egg Hopper');
      expect(service.extractServingDescription(entry)).toBe('2 pieces');
    });

    it('should extract name and count from custom combo JSON in unitName', () => {
      const entry = {
        food: null,
        unitName: JSON.stringify({
          name: 'Rice, Dhal & Chicken Plate',
          ingredients: ['Red Rice', 'Dhal Curry', 'Chicken Curry'],
        }),
        servingQuantity: 1,
      };
      expect(service.extractFoodName(entry)).toBe('Rice, Dhal & Chicken Plate');
      expect(service.extractServingDescription(entry)).toBe('3 items');
    });

    it('should fallback to unitName when foodId is null and unitName is not a generic unit', () => {
      const entry = {
        food: null,
        unitName: 'Katta Sambol',
        servingQuantity: 1,
      };
      expect(service.extractFoodName(entry)).toBe('Katta Sambol');
    });
  });

  describe('getTodaySummary & User Account Isolation', () => {
    it('should calculate accurate nutritional totals for populated diary', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Alice',
        targetCalories: 2000,
        targetProteinG: 120,
        targetCarbsG: 220,
        targetFatG: 60,
      });

      mockPrismaService.mealLog.findUnique.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        entries: [
          {
            meal: 'BREAKFAST',
            food: { name: 'Egg Hopper' },
            unitName: 'piece',
            servingQuantity: 2,
            loggedCaloriesKcal: 320,
            loggedProteinG: 16,
            loggedCarbohydratesG: 42,
            loggedFatG: 14,
          },
          {
            meal: 'LUNCH',
            food: { name: 'Chicken Curry & Rice' },
            unitName: 'plate',
            servingQuantity: 1,
            loggedCaloriesKcal: 550,
            loggedProteinG: 35,
            loggedCarbohydratesG: 70,
            loggedFatG: 12,
          },
        ],
      });

      const summary = await service.getTodaySummary('user-1', '2026-11-20', 'Asia/Colombo');

      expect(summary.dateStr).toBe('2026-11-20');
      expect(summary.totalCalories).toBe(870);
      expect(summary.totalProtein).toBe(51);
      expect(summary.totalCarbs).toBe(112);
      expect(summary.totalFat).toBe(26);
      expect(summary.targetCalories).toBe(2000);
      expect(summary.meals.length).toBe(2);
      expect(summary.meals[0].slot).toBe('Breakfast');
      expect(summary.meals[1].slot).toBe('Lunch');
    });

    it('should isolate Account A from Account B', async () => {
      // User A has logged entries
      mockPrismaService.mealLog.findUnique.mockImplementation(({ where }: any) => {
        if (where.userId_date.userId === 'user-a') {
          return Promise.resolve({
            id: 'log-a',
            userId: 'user-a',
            entries: [
              {
                meal: 'BREAKFAST',
                food: { name: 'Oatmeal' },
                unitName: 'bowl',
                servingQuantity: 1,
                loggedCaloriesKcal: 250,
                loggedProteinG: 10,
                loggedCarbohydratesG: 40,
                loggedFatG: 5,
              },
            ],
          });
        }
        return Promise.resolve(null);
      });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-b',
        targetCalories: 1800,
      });

      // User B query must return empty diary, not User A's data
      const summaryB = await service.getTodaySummary('user-b', '2026-11-20');
      expect(summaryB.totalCalories).toBe(0);
      expect(summaryB.meals.length).toBe(0);
    });

    it('should be strictly read-only and never call mutation methods', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', targetCalories: 2000 });
      mockPrismaService.mealLog.findUnique.mockResolvedValue(null);

      await service.getTodaySummary('user-1', '2026-11-20');

      // Verify no database write methods exist or were invoked
      expect((mockPrismaService.mealLog as any).create).toBeUndefined();
      expect((mockPrismaService.mealLog as any).update).toBeUndefined();
      expect((mockPrismaService.mealLog as any).upsert).toBeUndefined();
      expect((mockPrismaService.mealLog as any).delete).toBeUndefined();
    });
  });

  describe('tryHandleCoachDiaryIntent', () => {
    it('should return formatted summary with totals and meal list for today diary question', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        targetCalories: 2000,
        targetProteinG: 120,
        targetCarbsG: 220,
        targetFatG: 60,
      });

      mockPrismaService.mealLog.findUnique.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        entries: [
          {
            meal: 'BREAKFAST',
            food: { name: 'Egg Hopper' },
            unitName: 'piece',
            servingQuantity: 2,
            loggedCaloriesKcal: 320,
            loggedProteinG: 16,
            loggedCarbohydratesG: 42,
            loggedFatG: 14,
          },
        ],
      });

      const result = await service.tryHandleCoachDiaryIntent('user-1', 'What did I have today?', '2026-11-20');

      expect(result).not.toBeNull();
      expect(result!.reply).toContain("Here is what you've logged today (**2026-11-20**):");
      expect(result!.reply).toContain('**Calories:** 320 kcal / 2,000 kcal target (1,680 kcal remaining)');
      expect(result!.reply).toContain('**Protein:** 16g / 120g target');
      expect(result!.reply).toContain('* **Breakfast:** Egg Hopper (2 pieces) — 320 kcal');

      // Regression checks for technical review questions
      const resAte = await service.tryHandleCoachDiaryIntent('user-1', 'How much food have I ate today?', '2026-11-20');
      expect(resAte).not.toBeNull();
      expect(resAte!.reply).toContain("Here is what you've logged today (**2026-11-20**):");

      const resCalories = await service.tryHandleCoachDiaryIntent('user-1', 'How many calories did I eat today?', '2026-11-20');
      expect(resCalories).not.toBeNull();
      expect(resCalories!.reply).toContain("Here is what you've logged today (**2026-11-20**):");

      const resProtein = await service.tryHandleCoachDiaryIntent('user-1', 'How much protein did I eat today?', '2026-11-20');
      expect(resProtein).not.toBeNull();
      expect(resProtein!.reply).toContain("Here is what you've logged today (**2026-11-20**):");
    });

    it('should return friendly empty diary message when no meals are logged', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', targetCalories: 2000 });
      mockPrismaService.mealLog.findUnique.mockResolvedValue(null);

      const result = await service.tryHandleCoachDiaryIntent('user-1', 'What is my total intake today?', '2026-11-20');

      expect(result).not.toBeNull();
      expect(result!.reply).toContain("You haven't logged any meals yet for today (**2026-11-20**).");
      expect(result!.reply).toContain('Head over to Search or Home');
    });

    it('should return honest redirection for unsupported historical multi-day questions', async () => {
      const result = await service.tryHandleCoachDiaryIntent('user-1', 'What did I eat yesterday?');

      expect(result).not.toBeNull();
      expect(result!.reply).toContain('I can review your logged meals and macro totals for today!');
      expect(result!.reply).toContain('Detailed multi-day historical reporting is coming in V2');
      expect(result!.reply).toContain('Progress page or change the date on your Home diary');
    });

    it('should return null for non-diary coaching questions so they proceed to Gemini Coach', async () => {
      const result = await service.tryHandleCoachDiaryIntent('user-1', 'What should I eat to build muscle?');
      expect(result).toBeNull();
    });
  });
});
