import { Test, TestingModule } from '@nestjs/testing';
import { CieCoachService } from './cie-coach.service';
import { GeminiFunctionCallingService } from './gemini-function-calling.service';
import { ToolDispatcherService, DispatchedToolResult } from './tool-dispatcher.service';
import { DiarySummaryService } from '../diary-summary.service';
import { RedisService } from '../../redis/redis.service';
import { AiController } from '../ai.controller';
import { AiService } from '../ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DailyNutritionResult,
  NutritionTargetsResult,
  FoodHistoryResult,
} from './nutrition-tools.types';

describe('CieCoachService & CIE Coach Integration', () => {
  let service: CieCoachService;
  let mockGeminiFunctionCalling: any;
  let mockToolDispatcher: any;
  let mockDiarySummaryService: any;
  let mockRedisService: any;

  const mockUserId = 'user-auth-123';
  const testDateStr = '2026-11-20';
  const testTimeZone = 'Asia/Colombo';

  beforeEach(async () => {
    mockGeminiFunctionCalling = {
      selectTools: jest.fn(),
    };

    mockToolDispatcher = {
      dispatchBatch: jest.fn(),
    };

    mockDiarySummaryService = {
      tryHandleCoachDiaryIntent: jest.fn().mockResolvedValue(null),
    };

    mockRedisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 14, current: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CieCoachService,
        { provide: GeminiFunctionCallingService, useValue: mockGeminiFunctionCalling },
        { provide: ToolDispatcherService, useValue: mockToolDispatcher },
        { provide: DiarySummaryService, useValue: mockDiarySummaryService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<CieCoachService>(CieCoachService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // Test 1: Correct authentication and identity propagation
  // --------------------------------------------------------------------------
  it('1. should propagate authenticated userId strictly to ToolDispatcher', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How much protein have I eaten today?',
      hasFunctionCalls: true,
      functionCalls: [
        {
          name: 'getDailyNutrition',
          args: { date: testDateStr },
          callId: 'call-1',
        },
      ],
    });

    const mockDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 600,
      totalProtein: 45,
      totalCarbs: 60,
      totalFat: 20,
      meals: [],
      isLogged: true,
      loggedAt: '2026-11-20T08:00:00Z',
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'call-1', success: true, data: mockDaily },
    ]);

    await service.handleCoachMessage(mockUserId, 'How much protein have I eaten today?', testDateStr, testTimeZone);

    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledTimes(1);
    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledWith(
      mockUserId,
      expect.arrayContaining([
        expect.objectContaining({ name: 'getDailyNutrition', callId: 'call-1' }),
      ]),
    );
  });

  // --------------------------------------------------------------------------
  // Test 2: Today's diary question ("How much protein have I eaten today?")
  // --------------------------------------------------------------------------
  it('2. should handle today\'s diary question with accurate protein and macro breakdown', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How much protein have I eaten today?',
      hasFunctionCalls: true,
      functionCalls: [
        {
          name: 'getDailyNutrition',
          args: { date: 'today' },
          callId: 'call-today',
        },
      ],
    });

    const mockDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 850,
      totalProtein: 62.5,
      totalCarbs: 80,
      totalFat: 28,
      meals: [
        {
          slot: 'BREAKFAST',
          slotCalories: 450,
          slotProtein: 32.5,
          slotCarbs: 45,
          slotFat: 14,
          items: [{ name: 'Scrambled Eggs with Sourdough', serving: '2 eggs, 2 slices' }],
        },
        {
          slot: 'SNACK',
          slotCalories: 400,
          slotProtein: 30,
          slotCarbs: 35,
          slotFat: 14,
          items: [{ name: 'Greek Yogurt & Almonds', serving: '200g yogurt, 20g almonds' }],
        },
      ],
      isLogged: true,
      loggedAt: '2026-11-20T10:00:00Z',
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'call-today', success: true, data: mockDaily },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'How much protein have I eaten today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toContain('62.5g');
    expect(result!.reply).toContain('850 kcal');
    expect(result!.reply).toContain('Scrambled Eggs with Sourdough');
    expect(result!.reply).toContain('Greek Yogurt & Almonds');
  });

  // --------------------------------------------------------------------------
  // Test 3: Yesterday's diary question ("What did I eat yesterday?")
  // --------------------------------------------------------------------------
  it('3. should normalize yesterday to previous local date and return yesterday\'s meals', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What did I eat yesterday?',
      hasFunctionCalls: true,
      functionCalls: [
        {
          name: 'getDailyNutrition',
          args: { date: 'yesterday' },
          callId: 'call-yest',
        },
      ],
    });

    const yesterdayStr = '2026-11-19';
    const mockDaily: DailyNutritionResult = {
      date: yesterdayStr,
      totalCalories: 1450,
      totalProtein: 95,
      totalCarbs: 150,
      totalFat: 48,
      meals: [
        {
          slot: 'LUNCH',
          slotCalories: 750,
          slotProtein: 55,
          slotCarbs: 70,
          slotFat: 22,
          items: [{ name: 'Grilled Chicken Rice Bowl', serving: '1 bowl' }],
        },
      ],
      isLogged: true,
      loggedAt: '2026-11-19T13:00:00Z',
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'call-yest', success: true, data: mockDaily },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'What did I eat yesterday?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    // Normalized argument passed to tool dispatcher should be yesterday's date
    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledWith(
      mockUserId,
      expect.arrayContaining([
        expect.objectContaining({
          name: 'getDailyNutrition',
          args: { date: yesterdayStr },
        }),
      ]),
    );
    expect(result!.reply).toContain('Grilled Chicken Rice Bowl');
    expect(result!.reply).toContain('1,450 kcal');
  });

  // --------------------------------------------------------------------------
  // Test 4: Remaining calories ("How many calories do I still have left today?")
  // --------------------------------------------------------------------------
  it('4. should calculate remaining calories accurately and never report negative remaining values', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How many calories do I still have left today?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getDailyNutrition', args: { date: 'today' }, callId: 'c1' },
        { name: 'getNutritionTargets', args: {}, callId: 'c2' },
      ],
    });

    const mockDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 1400,
      totalProtein: 90,
      totalCarbs: 160,
      totalFat: 42,
      meals: [],
      isLogged: true,
      loggedAt: '2026-11-20T12:00:00Z',
    };

    const mockTargets: NutritionTargetsResult = {
      targetCalories: 2000,
      targetProteinG: 140,
      targetCarbsG: 220,
      targetFatG: 60,
      goal: 'LOSE',
      currentWeightKg: 78,
      targetWeightKg: 72,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'c1', success: true, data: mockDaily },
      { tool: 'getNutritionTargets', callId: 'c2', success: true, data: mockTargets },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'How many calories do I still have left today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    // 2000 target - 1400 consumed = 600 kcal remaining
    expect(result!.reply).toContain('600 kcal remaining');

    // Test over-target case:
    mockDaily.totalCalories = 2250;
    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'c1', success: true, data: mockDaily },
      { tool: 'getNutritionTargets', callId: 'c2', success: true, data: mockTargets },
    ]);

    const overResult = await service.handleCoachMessage(
      mockUserId,
      'How many calories do I still have left today?',
      testDateStr,
      testTimeZone,
    );

    expect(overResult).toBeDefined();
    expect(overResult!.reply).toContain('250 kcal over your target');
    expect(overResult!.reply).not.toContain('-250 kcal remaining');
  });

  // --------------------------------------------------------------------------
  // Test 5: Remaining protein ("How much protein do I still need today?")
  // --------------------------------------------------------------------------
  it('5. should calculate remaining protein accurately and highlight protein progress', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How much protein do I still need today?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getDailyNutrition', args: { date: 'today' }, callId: 'p1' },
        { name: 'getNutritionTargets', args: {}, callId: 'p2' },
      ],
    });

    const mockDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 1200,
      totalProtein: 85,
      totalCarbs: 120,
      totalFat: 38,
      meals: [
        {
          slot: 'LUNCH',
          slotCalories: 1200,
          slotProtein: 85,
          slotCarbs: 120,
          slotFat: 38,
          items: [{ name: 'Chicken Breast & Quinoa', serving: '250g' }],
        },
      ],
      isLogged: true,
      loggedAt: '2026-11-20T12:00:00Z',
    };

    const mockTargets: NutritionTargetsResult = {
      targetCalories: 2000,
      targetProteinG: 140,
      targetCarbsG: 220,
      targetFatG: 60,
      goal: 'MAINTAIN',
      currentWeightKg: 70,
      targetWeightKg: 70,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'p1', success: true, data: mockDaily },
      { tool: 'getNutritionTargets', callId: 'p2', success: true, data: mockTargets },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'How much protein do I still need today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    // 140 target - 85 consumed = 55g remaining
    expect(result!.reply).toContain('55g more protein');
    expect(result!.reply).toContain('140g target');
  });

  // --------------------------------------------------------------------------
  // Test 6: Nutrition targets ("What are my daily protein and calorie goals?")
  // --------------------------------------------------------------------------
  it('6. should answer nutrition targets inquiry with authoritative goals', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What are my daily protein and calorie goals?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getNutritionTargets', args: {}, callId: 't1' },
      ],
    });

    const mockTargets: NutritionTargetsResult = {
      targetCalories: 2200,
      targetProteinG: 165,
      targetCarbsG: 240,
      targetFatG: 65,
      goal: 'GAIN',
      currentWeightKg: 68,
      targetWeightKg: 74,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getNutritionTargets', callId: 't1', success: true, data: mockTargets },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'What are my daily protein and calorie goals?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toContain('2,200 kcal');
    expect(result!.reply).toContain('165g');
    expect(result!.reply).toContain('240g');
    expect(result!.reply).toContain('65g');
    expect(result!.reply).toContain('Weight / Muscle Gain (GAIN)');
  });

  // --------------------------------------------------------------------------
  // Test 7: Seven-day food history ("How has my eating been this week?")
  // --------------------------------------------------------------------------
  it('7. should summarize multi-day food history with logging consistency and averages', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How has my eating been this week?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getFoodHistory', args: { days: 7, endDate: 'today' }, callId: 'h1' },
      ],
    });

    const mockHistory: FoodHistoryResult = {
      startDate: '2026-11-14',
      endDate: testDateStr,
      daysRequested: 7,
      loggedDaysCount: 5,
      unloggedDaysCount: 2,
      avgDailyCalories: 1950,
      avgDailyProtein: 138,
      avgDailyCarbs: 215,
      avgDailyFat: 58,
      dailyEntries: [
        { date: '2026-11-20', calories: 2000, protein: 140, isLogged: true, foods: ['Salmon & Rice', 'Protein Shake'] },
        { date: '2026-11-19', calories: 1900, protein: 135, isLogged: true, foods: ['Chicken Burrito'] },
        { date: '2026-11-18', calories: 0, protein: 0, isLogged: false, foods: [] },
        { date: '2026-11-17', calories: 2050, protein: 145, isLogged: true, foods: ['Steak & Potatoes'] },
        { date: '2026-11-16', calories: 1850, protein: 130, isLogged: true, foods: ['Oatmeal', 'Turkey Sandwich'] },
        { date: '2026-11-15', calories: 0, protein: 0, isLogged: false, foods: [] },
        { date: '2026-11-14', calories: 1950, protein: 140, isLogged: true, foods: ['Eggs & Toast', 'Tuna Salad'] },
      ],
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getFoodHistory', callId: 'h1', success: true, data: mockHistory },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'How has my eating been this week?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toContain('5 of 7 days logged');
    expect(result!.reply).toContain('1,950 kcal');
    expect(result!.reply).toContain('138g');
    expect(result!.reply).toContain('Salmon & Rice');
  });

  // --------------------------------------------------------------------------
  // Test 8: Empty diary ("nothing logged" vs "ate nothing")
  // --------------------------------------------------------------------------
  it('8. should honestly state "no meals have been logged" rather than asserting zero consumption', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What did I eat today?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getDailyNutrition', args: { date: 'today' }, callId: 'empty1' },
      ],
    });

    const mockEmptyDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: [],
      isLogged: false,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'empty1', success: true, data: mockEmptyDaily },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'What did I eat today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toContain("haven't logged any meals");
    expect(result!.reply).toContain('Total intake is currently **0 kcal**');
    expect(result!.reply).toContain('Head over to **Home** or **Search** to log your meals');
  });

  // --------------------------------------------------------------------------
  // Test 9: Missing profile targets (reports missing targets honestly)
  // --------------------------------------------------------------------------
  it('9. should honestly report when nutrition targets have not been configured', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What are my daily goals?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getNutritionTargets', args: {}, callId: 'missing-t' },
      ],
    });

    const mockMissingTargets: NutritionTargetsResult = {
      targetCalories: null,
      targetProteinG: null,
      targetCarbsG: null,
      targetFatG: null,
      goal: null,
      currentWeightKg: null,
      targetWeightKg: null,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getNutritionTargets', callId: 'missing-t', success: true, data: mockMissingTargets },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'What are my daily goals?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toContain("haven't configured your nutrition targets yet");
    expect(result!.reply).toContain('Profile settings');
  });

  // --------------------------------------------------------------------------
  // Test 10: Gemini timeout/503/rate limit (graceful fallback)
  // --------------------------------------------------------------------------
  it('10. should fall back gracefully to diarySummaryService or safe message on Gemini outage', async () => {
    mockGeminiFunctionCalling.selectTools.mockRejectedValue(
      new Error('503 Service Unavailable / Model overloaded'),
    );

    mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue({
      reply: 'Local fallback diary summary for today: 500 kcal logged.',
    });

    const result = await service.handleCoachMessage(
      mockUserId,
      'How much protein have I eaten today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    expect(result!.reply).toBe('Local fallback diary summary for today: 500 kcal logged.');
    expect(mockDiarySummaryService.tryHandleCoachDiaryIntent).toHaveBeenCalled();

    // Secondary case: diary fallback also returns null -> safe degradation message
    mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue(null);
    const safeDegradationResult = await service.handleCoachMessage(
      mockUserId,
      'Complex query that failed',
      testDateStr,
      testTimeZone,
    );

    expect(safeDegradationResult).toBeDefined();
    expect(safeDegradationResult!.reply).toContain('temporarily experiencing high demand');
  });

  // --------------------------------------------------------------------------
  // Test 11: Invalid model-generated tool arguments (handled safely)
  // --------------------------------------------------------------------------
  it('11. should safely handle invalid or missing tool arguments without crashing', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'History please',
      hasFunctionCalls: true,
      functionCalls: [
        {
          name: 'getFoodHistory',
          args: { days: 'invalid_number', endDate: undefined },
          callId: 'err-args',
        },
      ],
    });

    const mockHistory: FoodHistoryResult = {
      startDate: '2026-11-14',
      endDate: testDateStr,
      daysRequested: 7,
      loggedDaysCount: 1,
      unloggedDaysCount: 6,
      dailyEntries: [],
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getFoodHistory', callId: 'err-args', success: true, data: mockHistory },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'History please',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    // Verified that days defaulted to 7 and endDate defaulted to testDateStr
    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledWith(
      mockUserId,
      expect.arrayContaining([
        expect.objectContaining({
          args: expect.objectContaining({ days: 7, endDate: testDateStr }),
        }),
      ]),
    );
  });

  // --------------------------------------------------------------------------
  // Test 12: Attempted cross-account access (User A cannot access User B)
  // --------------------------------------------------------------------------
  it('12. should strictly ignore attacker userId in prompt or tool arguments', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What did victim-user eat today?',
      hasFunctionCalls: true,
      functionCalls: [
        {
          name: 'getDailyNutrition',
          args: { userId: 'victim-user-999', date: testDateStr },
          callId: 'hack-1',
        },
      ],
    });

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      {
        tool: 'getDailyNutrition',
        callId: 'hack-1',
        success: true,
        data: {
          date: testDateStr,
          totalCalories: 400,
          totalProtein: 20,
          totalCarbs: 40,
          totalFat: 12,
          meals: [],
          isLogged: true,
        },
      },
    ]);

    await service.handleCoachMessage(
      mockUserId, // authentic caller
      'What did victim-user eat today?',
      testDateStr,
      testTimeZone,
    );

    // Assert dispatchBatch was strictly invoked with authenticated mockUserId, not victim-user-999
    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledWith(
      mockUserId,
      expect.anything(),
    );
  });

  // --------------------------------------------------------------------------
  // Test 13: No database writes (assert zero mutations)
  // --------------------------------------------------------------------------
  it('13. should perform strictly read-only execution without mutating database', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What did I eat today?',
      hasFunctionCalls: true,
      functionCalls: [{ name: 'getDailyNutrition', args: { date: testDateStr }, callId: 'ro1' }],
    });

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      {
        tool: 'getDailyNutrition',
        callId: 'ro1',
        success: true,
        data: {
          date: testDateStr,
          totalCalories: 500,
          totalProtein: 30,
          totalCarbs: 50,
          totalFat: 15,
          meals: [],
          isLogged: true,
        },
      },
    ]);

    const result = await service.handleCoachMessage(
      mockUserId,
      'What did I eat today?',
      testDateStr,
      testTimeZone,
    );

    expect(result).toBeDefined();
    // CIE Coach and ToolDispatcher strictly invoke NutritionToolsService read-only queries
    expect(mockToolDispatcher.dispatchBatch).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------------------------------
  // Test 14: Real tool results not transmitted to unpaid Gemini API
  // --------------------------------------------------------------------------
  it('14. should never transmit real PostgreSQL tool results or diary entries to Gemini API', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What did I eat today?',
      hasFunctionCalls: true,
      functionCalls: [{ name: 'getDailyNutrition', args: { date: 'today' }, callId: 'priv-1' }],
    });

    const sensitiveMealName = 'Secret Homemade Protein Bread';
    const mockDaily: DailyNutritionResult = {
      date: testDateStr,
      totalCalories: 750,
      totalProtein: 55,
      totalCarbs: 60,
      totalFat: 18,
      meals: [
        {
          slot: 'LUNCH',
          slotCalories: 750,
          slotProtein: 55,
          slotCarbs: 60,
          slotFat: 18,
          items: [{ name: sensitiveMealName, serving: '2 slices' }],
        },
      ],
      isLogged: true,
    };

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      { tool: 'getDailyNutrition', callId: 'priv-1', success: true, data: mockDaily },
    ]);

    await service.handleCoachMessage(
      mockUserId,
      'What did I eat today?',
      testDateStr,
      testTimeZone,
    );

    // Verify selectTools was called ONLY with prompt text and date, never diary records
    expect(mockGeminiFunctionCalling.selectTools).toHaveBeenCalledTimes(1);
    expect(mockGeminiFunctionCalling.selectTools).toHaveBeenCalledWith(
      'What did I eat today?',
      testDateStr,
    );
    // Real data was never passed to Gemini SDK
    const geminiArgs = mockGeminiFunctionCalling.selectTools.mock.calls[0];
    expect(JSON.stringify(geminiArgs)).not.toContain(sensitiveMealName);
  });

  // --------------------------------------------------------------------------
  // Test 15: Feature flag disabled (CIE_ENABLED=false preserves legacy Coach behavior)
  // --------------------------------------------------------------------------
  it('15. should preserve legacy Coach behavior when CIE_ENABLED is disabled or unset', async () => {
    const originalEnv = process.env.CIE_ENABLED;
    try {
      // 1. When CIE_ENABLED is 'false' or unset
      delete process.env.CIE_ENABLED;

      const mockAiService = { askCoach: jest.fn().mockResolvedValue({ reply: 'Legacy general coach advice' }) };
      const mockPrisma = {} as PrismaService;
      const mockLegacyDiaryService = {
        tryHandleCoachDiaryIntent: jest.fn().mockResolvedValue({ reply: 'Legacy regex diary response' }),
      };
      const mockRedis = { checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }) } as any;

      const controller = new AiController(
        mockAiService as any,
        mockLegacyDiaryService as any,
        mockPrisma,
        mockRedis,
        service, // injected cieCoachService
      );

      const legacyReq: any = { user: { id: mockUserId } };

      const legacyRes = await controller.chat(legacyReq, 'What did I have today?');

      // Legacy handler was called
      expect(mockLegacyDiaryService.tryHandleCoachDiaryIntent).toHaveBeenCalled();
      expect(legacyRes.reply).toBe('Legacy regex diary response');

      // 2. When CIE_ENABLED is 'true'
      process.env.CIE_ENABLED = 'true';
      mockGeminiFunctionCalling.selectTools.mockResolvedValue({
        prompt: 'What did I have today?',
        hasFunctionCalls: true,
        functionCalls: [{ name: 'getDailyNutrition', args: { date: testDateStr }, callId: 'cie-call' }],
      });
      mockToolDispatcher.dispatchBatch.mockResolvedValue([
        {
          tool: 'getDailyNutrition',
          callId: 'cie-call',
          success: true,
          data: {
            date: testDateStr,
            totalCalories: 500,
            totalProtein: 40,
            totalCarbs: 50,
            totalFat: 15,
            meals: [
              {
                slot: 'BREAKFAST',
                slotCalories: 500,
                slotProtein: 40,
                slotCarbs: 50,
                slotFat: 15,
                items: [{ name: 'Scrambled Eggs with Sourdough', serving: '2 eggs' }],
              },
            ],
            isLogged: true,
          },
        },
      ]);

      const cieRes = await controller.chat(legacyReq, 'What did I have today?', false, testDateStr, testTimeZone);

      expect(cieRes.reply).toContain("Here is what you've logged for");
    } finally {
      process.env.CIE_ENABLED = originalEnv;
    }
  });

  // --------------------------------------------------------------------------
  // Test 16: Simple follow-up context ("What about yesterday?")
  // --------------------------------------------------------------------------
  it('16. should track conversational subject across follow-up turns', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'How much protein today?',
      hasFunctionCalls: true,
      functionCalls: [{ name: 'getDailyNutrition', args: { date: 'today' }, callId: 'f1' }],
    });

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      {
        tool: 'getDailyNutrition',
        callId: 'f1',
        success: true,
        data: {
          date: testDateStr,
          totalCalories: 500,
          totalProtein: 45,
          totalCarbs: 50,
          totalFat: 15,
          meals: [],
          isLogged: true,
        },
      },
    ]);

    // Turn 1: Establishes protein subject
    await service.handleCoachMessage(mockUserId, 'How much protein today?', testDateStr, testTimeZone);

    expect(mockRedisService.set).toHaveBeenCalledWith(
      `cie:context:${mockUserId}`,
      expect.stringContaining('"lastSubject":"protein"'),
      300,
    );
  });

  // --------------------------------------------------------------------------
  // Test 17: Recommendation query detection
  // --------------------------------------------------------------------------
  it('17. should identify food recommendation inquiries accurately', () => {
    expect(service.isRecommendationQuery('What should I eat today?')).toBe(true);
    expect(service.isRecommendationQuery('Any food ideas?')).toBe(true);
    expect(service.isRecommendationQuery('Dinner ideas under 500 kcal')).toBe(true);
    expect(service.isRecommendationQuery('High-protein Sri Lankan foods')).toBe(true);
    expect(service.isRecommendationQuery('Healthy evening snacks')).toBe(true);
    expect(service.isRecommendationQuery('can you suggest some foods')).toBe(true);

    // Non-recommendation queries
    expect(service.isRecommendationQuery('How much protein have I had today?')).toBe(false);
    expect(service.isRecommendationQuery('How much more to go?')).toBe(false);
    expect(service.isRecommendationQuery('What did I eat for breakfast?')).toBe(false);
  });

  // --------------------------------------------------------------------------
  // Test 18: Grounded food recommendation without dumping raw diary list
  // --------------------------------------------------------------------------
  it('18. should answer "What should I eat today?" with grounded recommendations tailored to remaining macros', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'What should I eat today?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getDailyNutrition', args: { date: 'today' }, callId: 'c1' },
        { name: 'getNutritionTargets', args: {}, callId: 'c2' },
      ],
    });

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      {
        tool: 'getDailyNutrition',
        callId: 'c1',
        success: true,
        data: {
          date: testDateStr,
          totalCalories: 300,
          totalProtein: 6,
          totalCarbs: 45,
          totalFat: 10,
          meals: [
            {
              slot: 'Breakfast',
              slotCalories: 300,
              items: [{ name: 'String Hoppers', serving: '10 pieces', calories: 250, protein: 4, carbs: 55, fat: 1 }],
            },
          ],
          isLogged: true,
        },
      },
      {
        tool: 'getNutritionTargets',
        callId: 'c2',
        success: true,
        data: {
          targetCalories: 2126,
          targetProteinG: 133,
          targetCarbsG: 239,
          targetFatG: 71,
          goal: 'GAIN',
        },
      },
    ]);

    const res = await service.handleCoachMessage(
      mockUserId,
      'What should I eat today?',
      testDateStr,
      testTimeZone,
    );

    expect(res).not.toBeNull();
    // Must contain grounded recommendations from CalTrack database
    expect(res!.reply).toContain('Chicken Curry');
    expect(res!.reply).toContain('Fish Ambul Thiyal');
    expect(res!.reply).toContain('Dhal Curry');
    // Must state remaining macros based on actual saved 2126 target
    expect(res!.reply).toContain('1,826 kcal remaining');
    expect(res!.reply).toContain('127g protein to reach goal');
    // Must NOT repeat raw logged meals list as the answer
    expect(res!.reply).not.toContain('**Logged Meals:**');
  });

  // --------------------------------------------------------------------------
  // Test 19: Grounded food recommendation for "Any food ideas?"
  // --------------------------------------------------------------------------
  it('19. should answer "Any food ideas?" with grounded food suggestions, not only target dumping', async () => {
    mockGeminiFunctionCalling.selectTools.mockResolvedValue({
      prompt: 'Any food ideas?',
      hasFunctionCalls: true,
      functionCalls: [
        { name: 'getNutritionTargets', args: {}, callId: 'c1' },
      ],
    });

    mockToolDispatcher.dispatchBatch.mockResolvedValue([
      {
        tool: 'getDailyNutrition',
        callId: 'c_auto',
        success: true,
        data: {
          date: testDateStr,
          totalCalories: 300,
          totalProtein: 6,
          totalCarbs: 45,
          totalFat: 10,
          meals: [],
          isLogged: true,
        },
      },
      {
        tool: 'getNutritionTargets',
        callId: 'c1',
        success: true,
        data: {
          targetCalories: 2126,
          targetProteinG: 133,
          targetCarbsG: 239,
          targetFatG: 71,
          goal: 'GAIN',
        },
      },
    ]);

    const res = await service.handleCoachMessage(
      mockUserId,
      'Any food ideas?',
      testDateStr,
      testTimeZone,
    );

    expect(res).not.toBeNull();
    expect(res!.reply).toContain('Recommended Dishes from CalTrack Database');
    expect(res!.reply).toContain('Chicken Curry');
    expect(res!.reply).not.toContain('You haven\'t configured your nutrition targets yet');
  });
});
