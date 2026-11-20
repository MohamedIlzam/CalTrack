import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { GeminiFunctionCallingService } from './gemini-function-calling.service';
import { ToolDispatcherService } from './tool-dispatcher.service';
import { NutritionToolsService } from './nutrition-tools.service';
import {
  SYNTHETIC_DAILY_NUTRITION_FIXTURE,
  SYNTHETIC_TARGETS_FIXTURE,
  SYNTHETIC_FOOD_HISTORY_FIXTURE,
  SYNTHETIC_UNLOGGED_DAY_FIXTURE,
} from './synthetic-fixtures';

describe('GeminiFunctionCallingService (CIE Impl 02B: Real Function-Calling Verification)', () => {
  let service: GeminiFunctionCallingService;
  let dispatcher: ToolDispatcherService;

  beforeEach(async () => {
    const mockNutritionToolsService: any = {
      validateDateString: jest.fn((d) => d),
      validateDaysLimit: jest.fn((days) => days),
      getDailyNutrition: jest.fn(),
      getNutritionTargets: jest.fn(),
      getFoodHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiFunctionCallingService,
        ToolDispatcherService,
        { provide: NutritionToolsService, useValue: mockNutritionToolsService },
      ],
    }).compile();

    service = module.get<GeminiFunctionCallingService>(GeminiFunctionCallingService);
    dispatcher = module.get<ToolDispatcherService>(ToolDispatcherService);
  });

  // ---------------------------------------------------------------------------
  // 1. Tool Selection Mapping for the 5 Questions
  // ---------------------------------------------------------------------------
  describe('Natural-Language Tool Selection Mapping', () => {
    it('1. Maps Question 1 ("How much protein have I eaten today?") to getDailyNutrition', async () => {
      const mockCalls = [{ name: 'getDailyNutrition', args: { date: '2026-11-20' } }];
      const result = await service.selectTools('How much protein have I eaten today?', '2026-11-20', mockCalls);

      expect(result.hasFunctionCalls).toBe(true);
      expect(result.functionCalls.length).toBe(1);
      expect(result.functionCalls[0].name).toBe('getDailyNutrition');
      expect(result.functionCalls[0].args).toEqual({ date: '2026-11-20' });
    });

    it('2. Maps Question 2 ("What is my daily calorie target?") to getNutritionTargets', async () => {
      const mockCalls = [{ name: 'getNutritionTargets', args: {} }];
      const result = await service.selectTools('What is my daily calorie target?', '2026-11-20', mockCalls);

      expect(result.hasFunctionCalls).toBe(true);
      expect(result.functionCalls[0].name).toBe('getNutritionTargets');
    });

    it('3. Maps Question 3 ("How much protein do I still need today?") to MULTIPLE tools (daily + targets)', async () => {
      const mockCalls = [
        { name: 'getDailyNutrition', args: { date: '2026-11-20' } },
        { name: 'getNutritionTargets', args: {} },
      ];
      const result = await service.selectTools('How much protein do I still need today?', '2026-11-20', mockCalls);

      expect(result.hasFunctionCalls).toBe(true);
      expect(result.functionCalls.length).toBe(2);
      expect(result.functionCalls.map((c) => c.name)).toEqual(['getDailyNutrition', 'getNutritionTargets']);
    });

    it('4. Maps Question 4 ("What did I eat yesterday?") to getDailyNutrition with yesterday\'s date', async () => {
      const mockCalls = [{ name: 'getDailyNutrition', args: { date: '2026-11-19' } }];
      const result = await service.selectTools('What did I eat yesterday?', '2026-11-20', mockCalls);

      expect(result.hasFunctionCalls).toBe(true);
      expect(result.functionCalls[0].name).toBe('getDailyNutrition');
      expect(result.functionCalls[0].args).toEqual({ date: '2026-11-19' });
    });

    it('5. Maps Question 5 ("How has my food intake been over the last seven days?") to getFoodHistory', async () => {
      const mockCalls = [{ name: 'getFoodHistory', args: { days: 7 } }];
      const result = await service.selectTools('How has my food intake been over the last seven days?', '2026-11-20', mockCalls);

      expect(result.hasFunctionCalls).toBe(true);
      expect(result.functionCalls[0].name).toBe('getFoodHistory');
      expect(result.functionCalls[0].args).toEqual({ days: 7 });
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Deterministic Arithmetic & Correct Answers
  // ---------------------------------------------------------------------------
  describe('Deterministic Arithmetic & Result Explanation', () => {
    it('calculates remaining protein deterministically (Consumed: 95g, Target: 125g -> Remaining: 30g)', async () => {
      const toolCalls = [
        { name: 'getDailyNutrition', args: { date: '2026-11-20' } },
        { name: 'getNutritionTargets', args: {} },
      ];

      const demo = await service.runSyntheticDemonstration(
        'How much protein do I still need today?',
        toolCalls,
        {
          isSyntheticDemo: true,
          getDailyNutrition: SYNTHETIC_DAILY_NUTRITION_FIXTURE,
          getNutritionTargets: SYNTHETIC_TARGETS_FIXTURE,
        },
      );

      expect(demo.arithmetic).toBeDefined();
      expect(demo.arithmetic?.consumedProteinG).toBe(95);
      expect(demo.arithmetic?.targetProteinG).toBe(125);
      expect(demo.arithmetic?.remainingProteinG).toBe(30); // 125 - 95 = 30
      expect(demo.arithmetic?.remainingCalories).toBe(550); // 2000 - 1450 = 550

      expect(demo.finalAnswer).toContain('consumed 95g of your 125g protein target, leaving 30g remaining');
    });

    it('does not invent diary records on unlogged days (honestly explains no meals logged)', async () => {
      const demo = await service.runSyntheticDemonstration(
        'What did I eat on Wednesday?',
        [{ name: 'getDailyNutrition', args: { date: '2026-11-18' } }],
        {
          isSyntheticDemo: true,
          getDailyNutrition: SYNTHETIC_UNLOGGED_DAY_FIXTURE,
        },
      );

      expect(demo.finalAnswer).toContain('No meals were recorded for 2026-11-18. Total intake is 0 kcal.');
      // Must not hallucinate or invent food
      expect(demo.finalAnswer).not.toContain('Rice');
      expect(demo.finalAnswer).not.toContain('Chicken');
    });

    it('handles failed tool calls safely without crashing', async () => {
      const demo = await service.runSyntheticDemonstration(
        'Check broken tool',
        [{ name: 'unknownTool' as any }],
        {
          isSyntheticDemo: true,
          unknownTool: { isSyntheticDemo: true, error: 'Tool not permitted' },
        },
      );

      expect(demo.toolResults[0].success).toBe(false);
      expect(demo.finalAnswer).toContain('Could not retrieve unknownTool: Tool not permitted.');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Privacy Boundary Enforcement
  // ---------------------------------------------------------------------------
  describe('Privacy Boundary Enforcement', () => {
    it('blocks unflagged real database results from entering demonstration pathway', () => {
      const realUserRecord = {
        userId: 'real-db-user-id',
        totalCalories: 1950,
      };

      expect(() => {
        service.assertPrivacySafe(realUserRecord);
      }).toThrow(ForbiddenException);
    });

    it('blocks data that contains real email addresses or password hashes even if tagged isSyntheticDemo', () => {
      const maliciousSpoof = {
        isSyntheticDemo: true,
        email: 'victim@gmail.com',
        passwordHash: '$2b$10$real_hash',
      };

      expect(() => {
        service.assertPrivacySafe(maliciousSpoof);
      }).toThrow(ForbiddenException);
    });

    it('allows genuine synthetic fixtures', () => {
      expect(() => {
        service.assertPrivacySafe(SYNTHETIC_DAILY_NUTRITION_FIXTURE);
        service.assertPrivacySafe(SYNTHETIC_TARGETS_FIXTURE);
        service.assertPrivacySafe(SYNTHETIC_FOOD_HISTORY_FIXTURE);
      }).not.toThrow();
    });
  });
});
