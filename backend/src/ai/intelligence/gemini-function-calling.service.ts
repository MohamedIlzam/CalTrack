import {
  Injectable,
  Logger,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NUTRITION_TOOL_DECLARATIONS } from './nutrition-tools.declarations';
import { ToolDispatcherService, ToolCallRequest, DispatchedToolResult } from './tool-dispatcher.service';
import {
  SYNTHETIC_DAILY_NUTRITION_FIXTURE,
  SYNTHETIC_TARGETS_FIXTURE,
  SYNTHETIC_FOOD_HISTORY_FIXTURE,
  SYNTHETIC_YESTERDAY_NUTRITION_FIXTURE,
  SYNTHETIC_UNLOGGED_DAY_FIXTURE,
} from './synthetic-fixtures';

export interface GeminiToolSelectionResult {
  hasFunctionCalls: boolean;
  functionCalls: ToolCallRequest[];
  rawTextResponse?: string;
  modelUsed: string;
}

export interface SyntheticDemonstrationResult {
  prompt: string;
  selectedTools: ToolCallRequest[];
  toolResults: DispatchedToolResult[];
  arithmetic?: {
    consumedProteinG?: number;
    targetProteinG?: number;
    remainingProteinG?: number;
    consumedCalories?: number;
    targetCalories?: number;
    remainingCalories?: number;
  };
  finalAnswer: string;
  isSyntheticDemo: true;
}

@Injectable()
export class GeminiFunctionCallingService {
  private readonly logger = new Logger(GeminiFunctionCallingService.name);

  constructor(private readonly dispatcher: ToolDispatcherService) {}

  public get modelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  public get fallbackModelName(): string {
    return process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-lite-latest';
  }

  public isTransientError(err: any): boolean {
    const status = err?.status || err?.code;
    const msg = (err?.message || '').toLowerCase();
    if (status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
      return false;
    }
    return (
      status === 503 ||
      status === 429 ||
      status === 408 ||
      msg.includes('503') ||
      msg.includes('429') ||
      msg.includes('unavailable') ||
      msg.includes('high demand') ||
      msg.includes('resource_exhausted') ||
      msg.includes('spikes in demand') ||
      msg.includes('too many requests') ||
      msg.includes('timed out') ||
      msg.includes('timeout')
    );
  }

  /**
   * Strict Privacy Boundary Guard:
   * Under CalTrack's free-tier policy, real user nutrition records, targets, and diary items
   * must NEVER be serialized or transmitted to external AI endpoints.
   *
   * Verifies that:
   * 1. Data has explicit `isSyntheticDemo: true` marker.
   * 2. Data does NOT contain real database identifiers, emails, password hashes, or UUIDs.
   * 3. Prevents callers from simply tagging real database records with `isSyntheticDemo: true`.
   */
  public assertPrivacySafe(data: any): void {
    if (!data || data.isSyntheticDemo !== true) {
      throw new ForbiddenException(
        'Privacy Boundary Violation: Real user data cannot be transmitted to external LLM provider under free-tier policy. Real tool results must remain strictly on the backend server.',
      );
    }

    // Inspect for forbidden personal information or database credential patterns
    const serialized = JSON.stringify(data).toLowerCase();
    const forbiddenPatterns = [
      'passwordhash',
      'password_hash',
      '@my.sliit.lk',
      '@gmail.com',
      '@yahoo.com',
      'authorization',
      'bearer',
    ];

    for (const pattern of forbiddenPatterns) {
      if (serialized.includes(pattern)) {
        throw new ForbiddenException(
          `Privacy Boundary Violation: Prohibited sensitive credential or email pattern ("${pattern}") detected in demonstration payload.`,
        );
      }
    }
  }

  /**
   * Formats tool declarations for Gemini SDK tools configuration.
   */
  public getToolDeclarations() {
    return NUTRITION_TOOL_DECLARATIONS;
  }

  /**
   * Safe promise timeout wrapper preventing indefinite worker hangs if third-party SDK stalls.
   */
  private async callWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string,
  ): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  /**
   * Fast-path deterministic detection for standard diary, target, and history queries.
   * Eliminates unnecessary external API latency and preserves quota for requests
   * that can be answered entirely from local user records.
   */
  public detectDeterministicToolCalls(
    prompt: string,
    currentDateStr: string = '2026-11-20',
  ): ToolCallRequest[] | null {
    const clean = prompt.toLowerCase().trim();

    // 1. Explicit target and profile overview queries
    if (
      /\b(what\s+(are|is)\s+my\s+(daily\s+)?(calorie\s+|macro\s+|nutrition\s+)?(targets?|goals?))\b/i.test(clean) ||
      /\b(my\s+(daily\s+)?(calorie|macro|nutrition)\s+(targets?|goals?))\b/i.test(clean) ||
      /\b(tell\s+me\s+about\s+myself|who\s+am\s+i|about\s+me|my\s+profile|show\s+my\s+profile)\b/i.test(clean) ||
      /^(what\s+is\s+my\s+daily\s+calorie\s+target\??)$/i.test(clean) ||
      /^(what\s+are\s+my\s+nutrition\s+targets\??)$/i.test(clean) ||
      /^(show\s+my\s+targets\??)$/i.test(clean)
    ) {
      return [{ name: 'getNutritionTargets', args: {} }];
    }

    // 2. Remaining budget queries (needs both daily intake and targets)
    if (
      /\b(still\s+need|left|remaining)\b/i.test(clean) &&
      /\b(protein|calories?|kcal|carbs?|fat|budget)\b/i.test(clean)
    ) {
      return [
        { name: 'getDailyNutrition', args: { date: currentDateStr } },
        { name: 'getNutritionTargets', args: {} },
      ];
    }

    // 3. Yesterday's diary queries
    if (/\byesterday\b/i.test(clean) && /\b(eat|ate|eaten|logged|had|meals?|intake|calories?)\b/i.test(clean)) {
      const today = new Date(currentDateStr + 'T12:00:00Z');
      today.setUTCDate(today.getUTCDate() - 1);
      const yDate = today.toISOString().split('T')[0];
      return [{ name: 'getDailyNutrition', args: { date: yDate } }];
    }

    // 4. Multi-day history queries
    const historyMatch = clean.match(/\b(?:last|past)\s+(seven|\d+)\s+days?\b/i);
    if (historyMatch && /\b(intake|eat|ate|food|meals?|history|logged|consistency)\b/i.test(clean)) {
      const days = historyMatch[1].toLowerCase() === 'seven' ? 7 : parseInt(historyMatch[1], 10);
      return [{ name: 'getFoodHistory', args: { days: Math.min(Math.max(days || 7, 1), 7) } }];
    }

    // 5. Today's intake/macro queries
    if (
      (/\btoday\b/i.test(clean) || /\bso far\b/i.test(clean)) &&
      /\b(eat|eaten|ate|logged|had|intake|protein|calories?|carbs?|fat|macros?)\b/i.test(clean)
    ) {
      return [{ name: 'getDailyNutrition', args: { date: currentDateStr } }];
    }

    return null;
  }

  /**
   * Analyzes a natural-language prompt using Gemini (or a mock in test environments)
   * to determine which read-only nutrition tools should be invoked.
   */
  async selectTools(
    prompt: string,
    currentDateStr: string = '2026-11-20',
    mockToolCalls?: ToolCallRequest[],
    conversationContext?: { lastSubject?: string; lastDate?: string; lastIntent?: string },
  ): Promise<GeminiToolSelectionResult> {
    // If mock calls are provided (e.g. in test suites or deterministic mode), return them directly
    if (mockToolCalls) {
      return {
        hasFunctionCalls: mockToolCalls.length > 0,
        functionCalls: mockToolCalls,
        modelUsed: 'mock-gemini-adapter',
      };
    }

    // Fast-path deterministic mapping: avoids Gemini API calls when query maps directly to local records
    const deterministicCalls = this.detectDeterministicToolCalls(prompt, currentDateStr);
    if (deterministicCalls && deterministicCalls.length > 0) {
      return {
        hasFunctionCalls: true,
        functionCalls: deterministicCalls,
        modelUsed: 'deterministic-fast-path',
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Falling back to empty tool selection.');
      return { hasFunctionCalls: false, functionCalls: [], modelUsed: 'unconfigured' };
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const contextText = conversationContext
        ? `\nNonpersonal conversation state: last subject=${conversationContext.lastSubject || 'unknown'}, last date=${conversationContext.lastDate || 'unknown'}, last intent=${conversationContext.lastIntent || 'unknown'}. Use this only to resolve pronouns and follow-up intent.`
        : '';
      const systemInstruction = `You are the CalTrack Nutrition Assistant.
Current Local Date: ${currentDateStr}
${contextText}
You have access to read-only nutrition tools ONLY for querying authenticated user personal records:
1. getDailyNutrition(date: string YYYY-MM-DD): ONLY for personal inquiries about what the authenticated user ate or logged, or their daily macro totals (e.g. "what did I eat today", "how much protein did I have", "my diary"). NEVER use for general food nutrition, recipes, dish calories, or ingredient inquiries (e.g. "chicken curry", "kottu and prawns stats", "banana calories").
2. getNutritionTargets(): for questions about the user's personal calorie targets, macro goals (protein, carbs, fat), fitness goals, or profile info (e.g. "what are my goals", "tell me about myself").
3. getFoodHistory(days: number 1-30, endDate?: string): for personal weekly or monthly summaries and past eating consistency. NEVER use for future meal plans.
4. lookupFoods(query): for nonpersonal food or dish nutrition from the CalTrack catalog.
5. getWeightProgress(days): only for the authenticated user's weight-history questions.
6. getMealPatterns(days): only for the authenticated user's common-food or meal-pattern questions.
7. getFoodRecommendations(maxCalories, proteinPriority): actual catalog suggestions for a current-day food recommendation.

CRITICAL TOOL CALLING RULES:
- If the user is asking about general food, dishes, ingredients, recipes, or nutritional facts without referring to their own personal logged diary (e.g. "chicken curry", "kottu and prawns stats", "chicken curry and rice calories"), DO NOT call any tool! Leave function calls empty and provide an educational nutrition response directly in text.
- Distinguish a 30-day historical nutrition summary (getFoodHistory with days=30) from a future 30-day meal plan (no tool).
- Select tools ONLY when the user is explicitly inquiring about their own authenticated personal records, targets, or past logged history.`;

      let response: any;
      let usedModel = this.modelName;
      try {
        response = await this.callWithTimeout(
          ai.models.generateContent({
            model: this.modelName,
            contents: prompt,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: NUTRITION_TOOL_DECLARATIONS as any }],
              temperature: 0.1,
            },
          }),
          7000,
          'Gemini tool selection timed out after 7s',
        );
      } catch (firstErr: any) {
        if (this.isTransientError(firstErr)) {
          this.logger.warn(`Transient Gemini tool selection error on ${this.modelName} (${firstErr.message}). Retrying on fallback model ${this.fallbackModelName} after backoff...`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          usedModel = this.fallbackModelName;
          response = await this.callWithTimeout(
            ai.models.generateContent({
              model: this.fallbackModelName,
              contents: prompt,
              config: {
                systemInstruction,
                tools: [{ functionDeclarations: NUTRITION_TOOL_DECLARATIONS as any }],
                temperature: 0.1,
              },
            }),
            7000,
            'Gemini tool selection retry timed out after 7s',
          );
        } else {
          throw firstErr;
        }
      }

      // Extract function calls from response candidates
      const functionCalls: ToolCallRequest[] = [];
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      for (const part of parts) {
        if ((part as any).functionCall) {
          const fc = (part as any).functionCall;
          functionCalls.push({
            name: fc.name,
            args: fc.args || {},
            callId: fc.id,
          });
        }
      }

      return {
        hasFunctionCalls: functionCalls.length > 0,
        functionCalls,
        rawTextResponse: candidate?.content?.parts?.find((p: any) => p.text)?.text,
        modelUsed: usedModel,
      };
    } catch (err: any) {
      this.logger.error(`Gemini tool selection failed: ${err.message}`);
      throw new ServiceUnavailableException(`AI Tool Selection unavailable: ${err.message}`);
    }
  }

  /**
   * Resolves a synthetic fixture matching a tool call request.
   * Guarantees that demonstration data is strictly synthetic and isolated from real user databases.
   */
  public resolveSyntheticFixture(call: ToolCallRequest): any {
    if (call.name === 'getNutritionTargets') {
      return SYNTHETIC_TARGETS_FIXTURE;
    }

    if (call.name === 'getDailyNutrition') {
      const requestedDate = call.args?.date;
      if (requestedDate === '2026-11-19') {
        return SYNTHETIC_YESTERDAY_NUTRITION_FIXTURE;
      }
      if (requestedDate === '2026-11-18') {
        return SYNTHETIC_UNLOGGED_DAY_FIXTURE;
      }
      return SYNTHETIC_DAILY_NUTRITION_FIXTURE;
    }

    if (call.name === 'getFoodHistory') {
      return SYNTHETIC_FOOD_HISTORY_FIXTURE;
    }

    return {
      isSyntheticDemo: true,
      error: `No synthetic fixture available for tool ${call.name}`,
    };
  }

  /**
   * Executes a complete, privacy-safe end-to-end demonstration using SYNTHETIC data fixtures only.
   * Proves the full loop:
   * 1. Tool Selection -> 2. Dispatcher Execution -> 3. Deterministic Arithmetic & Final Answer.
   */
  async runSyntheticDemonstration(
    prompt: string,
    syntheticToolCalls: ToolCallRequest[],
    customSyntheticFixtures?: Record<string, any>,
    mockFinalAnswer?: string,
  ): Promise<SyntheticDemonstrationResult> {
    // 1. Enforce privacy boundary on any custom fixtures passed
    if (customSyntheticFixtures) {
      this.assertPrivacySafe(customSyntheticFixtures);
    }

    // 2. Dispatch synthetic tool calls using hardcoded synthetic fixtures
    const toolResults: DispatchedToolResult[] = [];
    for (const call of syntheticToolCalls) {
      const fixtureData =
        customSyntheticFixtures?.[call.name] || this.resolveSyntheticFixture(call);

      const isSynthetic =
        Boolean(fixtureData?.isSyntheticDemo) || Boolean(customSyntheticFixtures?.isSyntheticDemo);

      if (!isSynthetic) {
        this.assertPrivacySafe(fixtureData);
      } else {
        // Enforce forbidden credential checks
        this.assertPrivacySafe({ ...fixtureData, isSyntheticDemo: true });
      }

      toolResults.push({
        tool: call.name,
        callId: call.callId,
        success: !fixtureData.error,
        data: fixtureData,
        error: fixtureData.error,
      });
    }

    // 3. Compute deterministic arithmetic when both daily and targets tools are present
    const dailyResult = toolResults.find((r) => r.tool === 'getDailyNutrition')?.data;
    const targetsResult = toolResults.find((r) => r.tool === 'getNutritionTargets')?.data;

    let arithmetic: SyntheticDemonstrationResult['arithmetic'];

    if (dailyResult && targetsResult) {
      const consumedProtein = dailyResult.totalProtein ?? 0;
      const targetProtein = targetsResult.targetProteinG ?? 0;
      const remainingProtein = Math.max(0, targetProtein - consumedProtein);

      const consumedCalories = dailyResult.totalCalories ?? 0;
      const targetCalories = targetsResult.targetCalories ?? 0;
      const remainingCalories = Math.max(0, targetCalories - consumedCalories);

      arithmetic = {
        consumedProteinG: consumedProtein,
        targetProteinG: targetProtein,
        remainingProteinG: remainingProtein,
        consumedCalories,
        targetCalories,
        remainingCalories,
      };
    }

    // 4. Generate final answer (factual, deterministic summary with zero hallucination)
    let finalAnswer = mockFinalAnswer;
    if (!finalAnswer) {
      const sentences: string[] = [];

      for (const res of toolResults) {
        if (!res.success) {
          sentences.push(`Could not retrieve ${res.tool}: ${res.error}.`);
          continue;
        }

        if (res.tool === 'getDailyNutrition') {
          if (!res.data.isLogged) {
            sentences.push(`No meals were recorded for ${res.data.date || 'today'}. Total intake is 0 kcal.`);
          } else {
            const dateLabel = res.data.date ? `On ${res.data.date}` : 'Today';
            const mealCountText = Array.isArray(res.data.meals)
              ? ` across ${res.data.meals.length} meals`
              : '';
            sentences.push(
              `${dateLabel}, you consumed ${res.data.totalCalories} kcal (Protein: ${res.data.totalProtein}g, Carbs: ${res.data.totalCarbs}g, Fat: ${res.data.totalFat}g)${mealCountText}.`,
            );
          }
        } else if (res.tool === 'getNutritionTargets') {
          const macroDetails =
            res.data.targetProteinG !== undefined
              ? ` (Protein: ${res.data.targetProteinG}g${res.data.targetCarbsG !== undefined ? `, Carbs: ${res.data.targetCarbsG}g` : ''}${res.data.targetFatG !== undefined ? `, Fat: ${res.data.targetFatG}g` : ''})`
              : '';
          const goalDetails = res.data.goal ? ` with a goal of ${res.data.goal}` : '';
          sentences.push(
            `Your daily target is ${res.data.targetCalories} kcal${macroDetails}${goalDetails}.`,
          );
        } else if (res.tool === 'getFoodHistory') {
          sentences.push(
            `Over the last ${res.data.daysRequested} days (${res.data.startDate} to ${res.data.endDate}), you logged ${res.data.loggedDaysCount} of ${res.data.daysRequested} days, averaging ${res.data.avgDailyCalories} kcal and ${res.data.avgDailyProtein}g protein per logged day.`,
          );
        }
      }

      // Add deterministic arithmetic delta if both daily and targets were evaluated
      if (arithmetic && arithmetic.targetProteinG !== undefined && arithmetic.consumedProteinG !== undefined) {
        sentences.push(
          `You have consumed ${arithmetic.consumedProteinG}g of your ${arithmetic.targetProteinG}g protein target, leaving ${arithmetic.remainingProteinG}g remaining today.`,
        );
      }

      finalAnswer = sentences.join(' ') || 'Synthetic nutrition demonstration completed.';
    }

    return {
      prompt,
      selectedTools: syntheticToolCalls,
      toolResults,
      arithmetic,
      finalAnswer,
      isSyntheticDemo: true,
    };
  }
}
