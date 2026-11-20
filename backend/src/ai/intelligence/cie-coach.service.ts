import { Injectable, Logger, Optional } from '@nestjs/common';
import { GeminiFunctionCallingService } from './gemini-function-calling.service';
import { ToolDispatcherService, ToolCallRequest } from './tool-dispatcher.service';
import { CieResponseComposer, CieConversationContext } from './cie-response-composer';
import { DiarySummaryService } from '../diary-summary.service';
import { NutritionRagService } from './rag/nutrition-rag.service';
import { resolveDiaryDate, parseLocalDate } from '../../common/date.util';
import { RedisService } from '../../redis/redis.service';

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
   * Main CIE Coach entry point.
   * Returns `{ reply: string }` if a nutrition query was handled by CIE,
   * or `null` if the request is a general conversational chat that should fall through to standard Coach.
   */
  async handleCoachMessage(
    userId: string,
    message: string,
    dateStr?: string,
    timeZone?: string,
  ): Promise<{ reply: string } | null> {
    const trimmed = message.trim();

    // 1. Resolve local calendar dates consistently
    const { dateStr: resolvedTodayStr } = resolveDiaryDate(dateStr, timeZone);
    const todayUtc = parseLocalDate(resolvedTodayStr);
    const yesterdayUtc = new Date(todayUtc);
    yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1);
    const resolvedYesterdayStr = yesterdayUtc.toISOString().split('T')[0];

    // 2. Conservative Privacy Boundary Check
    if (!this.isPrivacySafePrompt(trimmed)) {
      this.logger.warn(`Prompt failed privacy check; falling back to local deterministic handling.`);
      return this.diarySummaryService.tryHandleCoachDiaryIntent(userId, trimmed, dateStr, timeZone);
    }

    // 3. Conversation Context Lookup
    const currentSubject = this.extractSubject(trimmed);
    const previousContext = await this.getContext(userId);
    const activeContext: CieConversationContext = {
      lastSubject: currentSubject || previousContext.lastSubject,
      lastDate: resolvedTodayStr,
    };

    // 4. Gemini Function Selection
    let selection;
    try {
      selection = await this.geminiFunctionCalling.selectTools(trimmed, resolvedTodayStr);
    } catch (err: any) {
      this.logger.warn(`Gemini tool selection failed (${err.message}); falling back to local diary intent.`);
      // Graceful fallback to regex intent handler when Gemini is unreachable or rate-limited
      const fallback = await this.diarySummaryService.tryHandleCoachDiaryIntent(
        userId,
        trimmed,
        dateStr,
        timeZone,
      );
      if (fallback) return fallback;

      // Safe user-friendly message on complete AI outage
      return {
        reply:
          "I'm temporarily experiencing high demand with external AI services. In the meantime, you can review your live diary on Home or inspect your analytics on the Progress page!",
      };
    }

    // 5. If no nutrition tools were requested, return null to let standard conversational Coach answer
    if (!selection || !selection.hasFunctionCalls || selection.functionCalls.length === 0) {
      return null;
    }

    // 6. Normalize Colloquial Model Date Arguments
    const normalizedCalls: ToolCallRequest[] = selection.functionCalls.map((call) => {
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

    // 7. Execute Tools Under Server-Side Authenticated Identity
    const toolResults = await this.toolDispatcher.dispatchBatch(userId, normalizedCalls);

    // 8. Update Follow-up Context
    await this.saveContext(userId, activeContext);

    // 9. Server-Side Deterministic Response Composition
    const composedReply = CieResponseComposer.composeCombinedResponse(toolResults, activeContext);

    return { reply: composedReply };
  }
}
