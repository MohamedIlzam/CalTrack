import { Injectable, Logger, Optional } from '@nestjs/common';
import { GeminiFunctionCallingService } from './gemini-function-calling.service';
import { ToolDispatcherService, ToolCallRequest } from './tool-dispatcher.service';
import { CieResponseComposer, CieConversationContext } from './cie-response-composer';
import { DiarySummaryService } from '../diary-summary.service';
import { NutritionRagService } from './rag/nutrition-rag.service';
import { resolveDiaryDate, parseLocalDate } from '../../common/date.util';
import { RedisService } from '../../redis/redis.service';
import {
  AiProvenance,
  PROVENANCE_CALTRACK_DATA,
  PROVENANCE_CALTRACK_LOCAL,
  PROVENANCE_LOCAL_FALLBACK,
  PROVENANCE_GEMINI,
} from '../provenance.types';

@Injectable()
export class CieCoachService {
  private readonly logger = new Logger(CieCoachService.name);

  // In-memory fallback context cache (bounded 5-minute TTL per user)
  private readonly memoryContextCache = new Map<string, CieConversationContext>();

  constructor(
    private readonly geminiFunctionCalling: GeminiFunctionCallingService,
    private readonly toolDispatcher: ToolDispatcherService,
    private readonly diarySummaryService: DiarySummaryService,
    private readonly redisService: RedisService,
    @Optional() private readonly nutritionRagService?: NutritionRagService,
  ) {}

  /**
   * Retrieves relevant nutrition knowledge passages from the RAG layer.
   * Internal CIE interface for contextual knowledge augmentation.
   */
  public async getNutritionKnowledgeContext(query: string, limit: number = 2) {
    if (!this.nutritionRagService) return [];
    return this.nutritionRagService.searchNutritionKnowledge(query, limit);
  }

  /**
   * Reads feature flag state.
   * Disabled by default until explicitly enabled via environment variable.
   */
  public isCieEnabled(): boolean {
    return process.env.CIE_ENABLED === 'true';
  }

  /**
   * Sanitizes and verifies user query text before sending to external model.
   * Rejects queries containing sensitive PII (emails, password credentials).
   */
  public isPrivacySafePrompt(prompt: string): boolean {
    const lower = prompt.toLowerCase();
    const sensitivePatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // email address
      /bearer\s+[a-zA-Z0-9._-]+/i, // auth token
      /password\s*[:=]/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(lower)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Extracts conversational subject to maintain simple follow-up context.
   */
  private extractSubject(message: string): CieConversationContext['lastSubject'] | undefined {
    const clean = message.toLowerCase();
    if (/\bprotein\b/.test(clean)) return 'protein';
    if (/\b(calorie|calories|kcal|budget)\b/.test(clean)) return 'calories';
    if (/\b(carb|carbs|carbohydrate|carbohydrates)\b/.test(clean)) return 'carbs';
    if (/\b(fat|fats)\b/.test(clean)) return 'fat';
    if (/\b(goal|goals|target|targets)\b/.test(clean)) return 'targets';
    if (/\b(history|week|recent|trend|trends)\b/.test(clean)) return 'history';
    if (/\b(meal|meals|food|foods|eat|ate)\b/.test(clean)) return 'meals';
    return undefined;
  }

  /**
   * Identifies user questions asking for food suggestions, meal ideas, or eating recommendations.
   */
  public isRecommendationQuery(message: string): boolean {
    const clean = message.toLowerCase().trim();
    return (
      /\b(what\s+should\s+i\s+eat|what\s+can\s+i\s+eat|what\s+to\s+eat)\b/i.test(clean) ||
      /\b(food\s+ideas?|meal\s+ideas?|snack\s+ideas?|dinner\s+ideas?|lunch\s+ideas?|breakfast\s+ideas?)\b/i.test(clean) ||
      (/\b(suggest|recommend|recommendation|recommendations|ideas?)\b/i.test(clean) &&
        /\b(food|foods|meal|meals|snack|snacks|eat|eating|dish|dishes)\b/i.test(clean)) ||
      /\bwhat\s+(should|can)\s+i\s+(have|cook|prepare)\b/i.test(clean) ||
      /\b(high-protein|healthy|low-calorie|post-workout)\s+(.+?\s+)?(foods?|meals?|snacks?|dishes)\b/i.test(clean)
    );
  }

  /**
   * Retrieves user follow-up context from Redis or memory fallback.
   */
  private async getContext(userId: string): Promise<CieConversationContext> {
    try {
      const cached = await this.redisService.get(`cie:context:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}

    const mem = this.memoryContextCache.get(userId);
    if (mem && mem.updatedAt && Date.now() - mem.updatedAt < 300000) {
      return mem;
    }
    return {};
  }

  /**
   * Saves user follow-up context with a strict 5-minute TTL.
   */
  private async saveContext(userId: string, context: CieConversationContext): Promise<void> {
    const ctx = { ...context, updatedAt: Date.now() };
    this.memoryContextCache.set(userId, ctx);

    try {
      await this.redisService.set(`cie:context:${userId}`, JSON.stringify(ctx), 300);
    } catch (_) {}
  }

  /**
   * Checks whether the user query has explicit personal intake/consumption or personal diary intent.
   */
  public hasPersonalConsumptionIntent(message: string): boolean {
    const clean = message.toLowerCase().trim();

    // Explicit diary or logging terms
    if (/\b(diary|logged|logging|log|history|consistency|trend|trends|intake|records?)\b/i.test(clean)) {
      return true;
    }

    // Time-based queries referencing today, yesterday, or past days
    if (/\b(today|yesterday|past\s+\d+\s+days?|last\s+\d+\s+days?|last\s+week|past\s+week|so\s+far)\b/i.test(clean)) {
      return true;
    }

    // Personal pronouns combined with food, eating, or macronutrients
    const hasPersonalPronoun = /\b(i|my|me|mine|we|our)\b/i.test(clean);
    const hasNutritionTerm = /\b(eat|eating|eaten|ate|had|have|consumed|meals?|food|foods|protein|calories?|kcal|carbs?|fat|macros?|budget|target|targets|goal|goals|left|remaining|need|needs)\b/i.test(clean);
    if (hasPersonalPronoun && hasNutritionTerm) {
      return true;
    }

    if (/\b(did|have)\s+i\b/i.test(clean)) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether the user is asking for multi-week, 30-day, or forward-looking meal plans.
   */
  public isMultiDayPlanningQuery(message: string): boolean {
    const clean = message.toLowerCase().trim();
    return (
      /\b(?:30|thirty|60|sixty|90|ninety)\s*[- ]?day\s+(?:plan|diet|program|meal\s*plan|workout|routine)\b/i.test(clean) ||
      (/\b(30|thirty)\s*day\b/i.test(clean) && /\b(plan|diet|meal|program)\b/i.test(clean)) ||
      /\b(create|give\s+me|make|generate)\s+(a\s+)?(?:30|thirty|multi-week)\s*day\b/i.test(clean)
    );
  }

  /**
   * Checks whether the user is asking about their personal profile, targets, or identity.
   */
  public isProfileOverviewQuery(message: string): boolean {
    const clean = message.toLowerCase().trim();
    return /\b(tell\s+me\s+about\s+myself|who\s+am\s+i|about\s+me|my\s+profile|show\s+my\s+profile)\b/i.test(clean);
  }

  /**
   * Main CIE Coach entry point.
   * Returns `{ reply: string; provenance: AiProvenance }` if a nutrition query was handled by CIE,
   * or `null` if the request is a general food/conversational chat that should fall through to standard Coach.
   */
  async handleCoachMessage(
    userId: string,
    message: string,
    dateStr?: string,
    timeZone?: string,
  ): Promise<{ reply: string; provenance: AiProvenance } | null> {
    const trimmed = message.trim();

    // 1. Resolve local calendar dates consistently
    const { dateStr: resolvedTodayStr } = resolveDiaryDate(dateStr, timeZone);
    const todayUtc = parseLocalDate(resolvedTodayStr);
    const yesterdayUtc = new Date(todayUtc);
    yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1);
    const resolvedYesterdayStr = yesterdayUtc.toISOString().split('T')[0];

    // 2. Intercept multi-week / 30-day planning requests (Scope Limitation)
    if (this.isMultiDayPlanningQuery(trimmed)) {
      return {
        reply:
          "CalTrack V1 specializes in real-time daily nutrition tracking, instant meal analysis, and grounded recommendations based on your daily targets. Comprehensive multi-week and 30-day meal planning is deferred to CalTrack Intelligence Engine V2.\n\nIn V1, you can:\n* Check your daily calorie and macronutrient targets\n* Ask for single-meal or snack recommendations matching your remaining budget\n* Review your logging consistency over the past 7 days\n* Log custom or AI-estimated meals on Home and Search",
        provenance: {
          source: 'caltrack_local',
          label: 'CalTrack Local',
          details: 'V1 scope limitation guidance',
        },
      };
    }

    // 3. Intercept profile overview queries (e.g. "tell me about myself")
    if (this.isProfileOverviewQuery(trimmed)) {
      const toolResults = await this.toolDispatcher.dispatchBatch(userId, [
        { name: 'getNutritionTargets', args: {} },
      ]);
      const targetsRes = toolResults.find((r) => r.tool === 'getNutritionTargets' && r.success)?.data;
      const composedReply = CieResponseComposer.composeProfileOverview(targetsRes as any);
      await this.saveContext(userId, { lastSubject: 'profile' });
      return {
        reply: composedReply,
        provenance: {
          source: 'caltrack_data',
          label: 'CalTrack Data',
          details: 'Authenticated user profile and targets',
        },
      };
    }

    // 4. Conservative Privacy Boundary Check
    if (!this.isPrivacySafePrompt(trimmed)) {
      this.logger.warn(`Prompt failed privacy check; falling back to local deterministic handling.`);
      const fallback = await this.diarySummaryService.tryHandleCoachDiaryIntent(userId, trimmed, dateStr, timeZone);
      if (fallback) {
        return fallback;
      }
      return {
        reply: 'I cannot process prompts containing credentials or sensitive personal information. Please ask a nutrition question instead.',
        provenance: {
          source: 'caltrack_local',
          label: 'CalTrack Local',
          details: 'Privacy boundary filter',
        },
      };
    }

    // 5. Conversation Context Lookup
    const isRecommendation = this.isRecommendationQuery(trimmed);
    const currentSubject = isRecommendation ? 'recommendation' : this.extractSubject(trimmed);
    const previousContext = await this.getContext(userId);
    const activeContext: CieConversationContext = {
      lastSubject: currentSubject || previousContext.lastSubject,
      isRecommendation,
      lastDate: resolvedTodayStr,
    };

    // 6. Gemini Function Selection
    let selection;
    try {
      selection = await this.geminiFunctionCalling.selectTools(trimmed, resolvedTodayStr);
    } catch (err: any) {
      this.logger.warn(`Gemini tool selection failed (${err.message}); falling back to local handling.`);
      if (isRecommendation) {
        const toolResults = await this.toolDispatcher.dispatchBatch(userId, [
          { name: 'getDailyNutrition', args: { date: resolvedTodayStr } },
          { name: 'getNutritionTargets', args: {} },
        ]);
        const composedReply = CieResponseComposer.composeCombinedResponse(toolResults, activeContext);
        return {
          reply: composedReply,
          provenance: {
            source: 'caltrack_data',
            label: 'CalTrack Data',
            details: 'Local database food recommendations',
          },
        };
      }

      // Graceful fallback to regex intent handler when Gemini is unreachable or rate-limited
      if (this.hasPersonalConsumptionIntent(trimmed) || this.diarySummaryService?.isTodayDiaryQuery?.(trimmed)) {
        const fallback = await this.diarySummaryService.tryHandleCoachDiaryIntent(
          userId,
          trimmed,
          dateStr,
          timeZone,
        );
        if (fallback) {
          return {
            reply: fallback.reply,
            provenance: {
              source: 'local_fallback',
              label: 'Local Fallback',
              details: 'Local PostgreSQL diary summary fallback',
            },
          };
        }
      }

      // Safe user-friendly message on complete AI outage for non-diary queries
      return {
        reply:
          "I'm temporarily experiencing high demand with external AI services. In the meantime, you can review your live diary on Home or inspect your analytics on the Progress page!",
        provenance: {
          source: 'local_fallback',
          label: 'Local Fallback',
          details: 'AI service unavailable notice',
        },
      };
    }

    // 7. Filter Inappropriate Tool Calls (e.g. Gemini selecting getDailyNutrition for general food queries)
    const rawCalls = selection?.functionCalls || [];
    const hasPersonalIntent = this.hasPersonalConsumptionIntent(trimmed);

    const appropriateCalls = rawCalls.filter((call) => {
      // Disallow diary/history tools if user query has NO personal consumption intent
      if (call.name === 'getDailyNutrition' || call.name === 'getFoodHistory') {
        return hasPersonalIntent;
      }
      return true;
    });

    // 8. If no valid tools remain:
    if (appropriateCalls.length === 0) {
      if (isRecommendation) {
        const toolResults = await this.toolDispatcher.dispatchBatch(userId, [
          { name: 'getDailyNutrition', args: { date: resolvedTodayStr } },
          { name: 'getNutritionTargets', args: {} },
        ]);
        const composedReply = CieResponseComposer.composeCombinedResponse(toolResults, activeContext);
        return {
          reply: composedReply,
          provenance: {
            source: 'caltrack_data',
            label: 'CalTrack Data',
            details: 'Grounded Sri Lankan food database recommendations',
          },
        };
      }

      // If Gemini provided a helpful direct text response without tool calls, return it
      if (selection?.rawTextResponse && selection.rawTextResponse.trim().length > 20) {
        return {
          reply: selection.rawTextResponse.trim(),
          provenance: {
            source: 'gemini',
            label: 'Gemini AI',
            details: `Direct response from ${selection.modelUsed}`,
          },
        };
      }

      // Fall through to standard askCoach for expert food nutrition analysis (e.g. "chicken curry", "kottu and prawns stats")
      return null;
    }

    // 9. Normalize Colloquial Model Date Arguments
    const normalizedCalls: ToolCallRequest[] = appropriateCalls.map((call) => {
      const cleanArgs = { ...(call.args || {}) };

      if (call.name === 'getDailyNutrition') {
        const rawDate = cleanArgs.date;
        if (!rawDate || rawDate === 'today') {
          cleanArgs.date = resolvedTodayStr;
        } else if (rawDate === 'yesterday') {
          cleanArgs.date = resolvedYesterdayStr;
        }
      }

      if (call.name === 'getFoodHistory') {
        if (!cleanArgs.days || isNaN(cleanArgs.days)) {
          cleanArgs.days = 7;
        }
        if (!cleanArgs.endDate || cleanArgs.endDate === 'today') {
          cleanArgs.endDate = resolvedTodayStr;
        }
      }

      return {
        name: call.name,
        args: cleanArgs,
        callId: call.callId,
      };
    });

    // If recommendation query, guarantee both daily nutrition and targets are dispatched for macro awareness
    if (isRecommendation) {
      if (!normalizedCalls.some((c) => c.name === 'getDailyNutrition')) {
        normalizedCalls.push({
          name: 'getDailyNutrition',
          args: { date: resolvedTodayStr },
        });
      }
      if (!normalizedCalls.some((c) => c.name === 'getNutritionTargets')) {
        normalizedCalls.push({
          name: 'getNutritionTargets',
          args: {},
        });
      }
    }

    // 10. Execute Tools Under Server-Side Authenticated Identity
    const toolResults = await this.toolDispatcher.dispatchBatch(userId, normalizedCalls);

    // 11. Update Follow-up Context
    await this.saveContext(userId, activeContext);

    // 12. Server-Side Deterministic Response Composition
    const composedReply = CieResponseComposer.composeCombinedResponse(toolResults, activeContext);

    return {
      reply: composedReply,
      provenance: {
        source: 'caltrack_data',
        label: 'CalTrack Data',
        details: isRecommendation
          ? 'Grounded Sri Lankan food database recommendations'
          : 'Authenticated PostgreSQL user records',
      },
    };
  }
}
