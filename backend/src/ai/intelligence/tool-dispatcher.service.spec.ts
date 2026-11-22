import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ToolDispatcherService,
  MAX_TOOL_CALLS_PER_REQUEST,
} from './tool-dispatcher.service';
import { NutritionToolsService } from './nutrition-tools.service';
import { GeminiFunctionCallingService } from './gemini-function-calling.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DiarySummaryService } from '../diary-summary.service';

describe('ToolDispatcherService & Gemini Function Calling Foundation (CIE Impl 02)', () => {
  let dispatcher: ToolDispatcherService;
  let functionCallingService: GeminiFunctionCallingService;
  let nutritionToolsService: {
    getDailyNutrition: jest.Mock;
    getNutritionTargets: jest.Mock;
    getFoodHistory: jest.Mock;
  };

  const authenticatedUserId = 'user-synthetic-auth-123';

  beforeEach(async () => {
    nutritionToolsService = {
      getDailyNutrition: jest.fn(),
      getNutritionTargets: jest.fn(),
      getFoodHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolDispatcherService,
        GeminiFunctionCallingService,
        { provide: NutritionToolsService, useValue: nutritionToolsService },
        { provide: PrismaService, useValue: {} },
        { provide: DiarySummaryService, useValue: {} },
      ],
    }).compile();

    dispatcher = module.get<ToolDispatcherService>(ToolDispatcherService);
    functionCallingService = module.get<GeminiFunctionCallingService>(
      GeminiFunctionCallingService,
    );
  });

  // ---------------------------------------------------------------------------
  // 1. Model Request for Daily Nutrition Maps to Correct Tool
  // ---------------------------------------------------------------------------
  it("1. A model request for today's nutrition maps to getDailyNutrition with validated date", async () => {
    const mockDailyResult = {
      date: '2026-11-20',
      isLogged: true,
      totalCalories: 1850,
      totalProtein: 120,
      totalCarbs: 210,
      totalFat: 55,
      meals: [],
    };
    nutritionToolsService.getDailyNutrition.mockResolvedValue(mockDailyResult);

    const result = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getDailyNutrition',
      args: { date: '2026-11-20' },
    });

    expect(result.success).toBe(true);
    expect(result.tool).toBe('getDailyNutrition');
    expect(result.data).toEqual(mockDailyResult);
    expect(nutritionToolsService.getDailyNutrition).toHaveBeenCalledWith(
      authenticatedUserId,
      { date: '2026-11-20' },
    );
  });

  // ---------------------------------------------------------------------------
  // 2. Request for Nutrition Goals Maps to getNutritionTargets
  // ---------------------------------------------------------------------------
  it('2. A request for nutrition goals maps to getNutritionTargets', async () => {
    const mockTargetsResult = {
      targetCalories: 2000,
      targetProteinG: 125,
      targetCarbsG: 225,
      targetFatG: 65,
      goal: 'LOSE',
      currentWeightKg: 70.0,
      targetWeightKg: 66.0,
      heightCm: 175,
      activityLevel: 'MODERATE',
    };
    nutritionToolsService.getNutritionTargets.mockResolvedValue(
      mockTargetsResult,
    );

    const result = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getNutritionTargets',
      args: {},
    });

    expect(result.success).toBe(true);
    expect(result.tool).toBe('getNutritionTargets');
    expect(result.data).toEqual(mockTargetsResult);
    expect(nutritionToolsService.getNutritionTargets).toHaveBeenCalledWith(
      authenticatedUserId,
    );
  });

  // ---------------------------------------------------------------------------
  // 3. History Request Maps to getFoodHistory
  // ---------------------------------------------------------------------------
  it('3. A history request maps to getFoodHistory with validated days limit', async () => {
    const mockHistoryResult = {
      startDate: '2026-11-14',
      endDate: '2026-11-20',
      daysRequested: 7,
      loggedDaysCount: 5,
      unloggedDaysCount: 2,
      avgDailyCalories: 1820,
      avgDailyProtein: 118,
      avgDailyCarbs: 205,
      avgDailyFat: 58,
      dailyEntries: [],
    };
    nutritionToolsService.getFoodHistory.mockResolvedValue(mockHistoryResult);

    const result = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getFoodHistory',
      args: { days: 7, endDate: '2026-11-20' },
    });

    expect(result.success).toBe(true);
    expect(result.tool).toBe('getFoodHistory');
    expect(result.data).toEqual(mockHistoryResult);
    expect(nutritionToolsService.getFoodHistory).toHaveBeenCalledWith(
      authenticatedUserId,
      {
        days: 7,
        endDate: '2026-11-20',
      },
    );
  });

  // ---------------------------------------------------------------------------
  // 4. Multiple Required Tool Calls Handled Safely in Batch
  // ---------------------------------------------------------------------------
  it("4. Multiple required tool calls (e.g. today's nutrition + targets) are handled safely", async () => {
    nutritionToolsService.getDailyNutrition.mockResolvedValue({
      date: '2026-11-20',
      totalCalories: 1500,
      isLogged: true,
    });
    nutritionToolsService.getNutritionTargets.mockResolvedValue({
      targetCalories: 2000,
      goal: 'MAINTAIN',
    });

    const calls = [
      { name: 'getDailyNutrition', args: { date: '2026-11-20' } },
      { name: 'getNutritionTargets', args: {} },
    ];

    const results = await dispatcher.dispatchBatch(authenticatedUserId, calls);

    expect(results.length).toBe(2);
    expect(results[0].success).toBe(true);
    expect(results[0].tool).toBe('getDailyNutrition');
    expect(results[1].success).toBe(true);
    expect(results[1].tool).toBe('getNutritionTargets');
  });

  it('4b. Batch execution enforces MAX_TOOL_CALLS_PER_REQUEST boundary', async () => {
    const excessiveCalls = [
      { name: 'getNutritionTargets' },
      { name: 'getNutritionTargets' },
      { name: 'getNutritionTargets' },
      { name: 'getNutritionTargets' }, // 4th call exceeds max limit of 3
    ];

    await expect(
      dispatcher.dispatchBatch(authenticatedUserId, excessiveCalls),
    ).rejects.toThrow(BadRequestException);
  });

  // ---------------------------------------------------------------------------
  // 5. Invalid Function Names are Rejected
  // ---------------------------------------------------------------------------
  it('5. Invalid function names are rejected without dynamic code execution', async () => {
    const invalidCalls = [
      'deleteUser',
      'updateNutritionTargets',
      'executeRawSql',
      '__proto__',
      'constructor',
      'unknownTool',
    ];

    for (const name of invalidCalls) {
      const result = await dispatcher.dispatch(authenticatedUserId, { name });
      expect(result.success).toBe(false);
      expect(result.error).toContain('not recognized or permitted');
    }

    // Ensure no backend tool service methods were touched
    expect(nutritionToolsService.getDailyNutrition).not.toHaveBeenCalled();
    expect(nutritionToolsService.getNutritionTargets).not.toHaveBeenCalled();
    expect(nutritionToolsService.getFoodHistory).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 6. Malformed Model Arguments are Rejected
  // ---------------------------------------------------------------------------
  it('6. Malformed model arguments are rejected gracefully with clean error messages', async () => {
    // Missing required date
    const resMissingDate = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getDailyNutrition',
      args: {},
    });
    expect(resMissingDate.success).toBe(false);
    expect(resMissingDate.error).toContain(
      'Missing required parameter: "date"',
    );

    // Missing required days in getFoodHistory
    const resMissingDays = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getFoodHistory',
      args: {},
    });
    expect(resMissingDays.success).toBe(false);
    expect(resMissingDays.error).toContain(
      'Missing required parameter: "days"',
    );

    // Service-level validation errors (e.g. invalid date format or out-of-range days)
    nutritionToolsService.getDailyNutrition.mockRejectedValue(
      new BadRequestException('Invalid day "31" for month 02'),
    );
    const resInvalidDate = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getDailyNutrition',
      args: { date: '2026-02-31' },
    });
    expect(resInvalidDate.success).toBe(false);
    expect(resInvalidDate.error).toContain('Invalid day "31" for month 02');
  });

  // ---------------------------------------------------------------------------
  // 7. Model Cannot Choose or Override a User ID
  // ---------------------------------------------------------------------------
  it('7. Model cannot choose or override userId (identity pinning guard)', async () => {
    nutritionToolsService.getDailyNutrition.mockResolvedValue({
      date: '2026-11-20',
      isLogged: true,
    });

    // Attempted model injection of spoofed userId in arguments
    const result = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getDailyNutrition',
      args: {
        date: '2026-11-20',
        userId: 'victim-user-999',
        user_id: 'victim-user-999',
        id: 'victim-user-999',
      },
    });

    expect(result.success).toBe(true);
    // Verified: Only authenticatedUserId was passed to the underlying service
    expect(nutritionToolsService.getDailyNutrition).toHaveBeenCalledWith(
      authenticatedUserId,
      { date: '2026-11-20' },
    );
  });

  it('7b. Missing server-side userId is rejected with UnauthorizedException', async () => {
    await expect(
      dispatcher.dispatch('', { name: 'getNutritionTargets' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // ---------------------------------------------------------------------------
  // 8. Unknown / Write-Capable Operations are Rejected
  // ---------------------------------------------------------------------------
  it('8. Unknown and write-capable operations are strictly rejected by the allowlist', () => {
    expect(dispatcher.isToolAllowed('recordMeal')).toBe(false);
    expect(dispatcher.isToolAllowed('updateProfile')).toBe(false);
    expect(dispatcher.isToolAllowed('deleteWeight')).toBe(false);
    expect(dispatcher.isToolAllowed('dropTable')).toBe(false);

    // Only approved 3 read-only tools are allowed
    expect(dispatcher.isToolAllowed('getDailyNutrition')).toBe(true);
    expect(dispatcher.isToolAllowed('getNutritionTargets')).toBe(true);
    expect(dispatcher.isToolAllowed('getFoodHistory')).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 9. Tool Failures are Handled Safely Without Leaking Stack Traces
  // ---------------------------------------------------------------------------
  it('9. Tool failures return safe error descriptions without leaking stack traces or database info', async () => {
    nutritionToolsService.getFoodHistory.mockRejectedValue(
      new Error('Internal database connection timeout'),
    );

    const result = await dispatcher.dispatch(authenticatedUserId, {
      name: 'getFoodHistory',
      args: { days: 7 },
    });

    expect(result.success).toBe(false);
    expect(result.tool).toBe('getFoodHistory');
    expect(result.error).toBe('Tool execution unavailable');
    expect(result.error).not.toContain('database');
    // Ensure no stack trace object was attached
    expect((result as any).stack).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // 10. Privacy Boundary: Real User Data Cannot Reach Free-Tier Gemini Adapter
  // ---------------------------------------------------------------------------
  it('10. Privacy Boundary: Real user nutrition records cannot be sent to Gemini adapter under free-tier policy', async () => {
    const realUserData = {
      userId: 'real-user-123',
      name: 'Real User',
      calories: 1950,
      // NOT marked as isSyntheticDemo: true
    };

    // Attempting to pass real user data into Gemini function calling adapter throws ForbiddenException
    expect(() => {
      functionCallingService.assertPrivacySafe(realUserData);
    }).toThrow(ForbiddenException);

    // Passing synthetic fixture flagged with isSyntheticDemo: true succeeds
    const syntheticData = {
      isSyntheticDemo: true,
      totalCalories: 2000,
    };
    expect(() => {
      functionCallingService.assertPrivacySafe(syntheticData);
    }).not.toThrow();
  });

  // ---------------------------------------------------------------------------
  // Synthetic End-to-End Demonstration Loop
  // ---------------------------------------------------------------------------
  it('End-to-End Demonstration: Runs full synthetic tool-call and response loop cleanly', async () => {
    const syntheticPrompt =
      'How much protein have I eaten today, and what is my daily target?';
    const syntheticToolCalls = [
      { name: 'getDailyNutrition', args: { date: '2026-11-20' } },
      { name: 'getNutritionTargets', args: {} },
    ];
    const syntheticNutritionFixtures = {
      isSyntheticDemo: true,
      getDailyNutrition: {
        totalCalories: 1450,
        totalProtein: 95,
        totalCarbs: 160,
        totalFat: 48,
        isLogged: true,
      },
      getNutritionTargets: {
        targetCalories: 2000,
        targetProteinG: 125,
        goal: 'LOSE',
      },
    };

    const demoResult = await functionCallingService.runSyntheticDemonstration(
      syntheticPrompt,
      syntheticToolCalls,
      syntheticNutritionFixtures,
    );

    expect(demoResult.isSyntheticDemo).toBe(true);
    expect(demoResult.selectedTools.length).toBe(2);
    expect(demoResult.toolResults.length).toBe(2);
    expect(demoResult.finalAnswer).toContain('consumed 1450 kcal');
    expect(demoResult.finalAnswer).toContain('Your daily target is 2000 kcal');
  });
});
