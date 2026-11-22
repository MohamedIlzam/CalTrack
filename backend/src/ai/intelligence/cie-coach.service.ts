import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { resolveDiaryDate } from '../../common/date.util';
import { RedisService } from '../../redis/redis.service';
import {
  CoachHistoryEntry,
  CoachPrivacyMode,
  GeminiFunctionCallingService,
} from './gemini-function-calling.service';
import { AiProvenance } from '../provenance.types';

export const PERSONALIZED_GEMINI_CONSENT_VERSION = '2026-11-22';
const CONTEXT_TTL_SECONDS = 600;
const MAX_HISTORY_MESSAGES = 8;

interface StoredConversationMessage extends CoachHistoryEntry {
  mode: CoachPrivacyMode;
}

interface StoredConversationState {
  messages: StoredConversationMessage[];
  updatedAt: number;
}

export interface CoachPrivacyRequest {
  personalizedConsent?: boolean;
  consentVersion?: string;
}

@Injectable()
export class CieCoachService {
  private readonly logger = new Logger(CieCoachService.name);
  private readonly memoryContextCache = new Map<
    string,
    StoredConversationState
  >();

  constructor(
    private readonly geminiFunctionCalling: GeminiFunctionCallingService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * The operator must explicitly attest to an eligible paid/data-processing configuration.
   * An API key alone never enables transmission of personal records.
   */
  public isPersonalizedModeConfigured(): boolean {
    return (
      process.env.GEMINI_PERSONALIZED_DATA_ENABLED === 'true' &&
      process.env.GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION ===
        'PAID_DATA_TERMS_CONFIRMED'
    );
  }

  public isPrivacySafePrompt(prompt: string): boolean {
    const sensitivePatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      /bearer\s+[a-zA-Z0-9._-]+/i,
      /(?:password|api[_ -]?key|access[_ -]?token|secret)\s*[:=]/i,
      /\b(?:\+?\d[\d\s()-]{7,}\d)\b/,
      /\b(?:home address|date of birth|passport|national id)\s*[:=]/i,
      /\bmy name is\b/i,
      /\b(?:diagnosed with|medical record|medication|prescription|blood sugar|blood pressure)\b/i,
    ];
    return !sensitivePatterns.some((pattern) => pattern.test(prompt));
  }

  /** A deliberately small classifier for selecting the privacy gate, not for composing answers. */
  public hasPersonalConsumptionIntent(
    message: string,
    previousMode?: CoachPrivacyMode,
  ): boolean {
    const clean = message.toLowerCase();
    if (
      /\b(tell me about myself|my profile|my target|my goal|my weight|my height|my bmi|my diary|my history|my summary|i weigh)\b/.test(
        clean,
      )
    )
      return true;
    if (/\b(weekly|monthly|7-day|30-day) nutrition summary\b/.test(clean))
      return true;
    if (
      /\b(today|yesterday|last week|this week|last month|monthly summary)\b/.test(
        clean,
      ) &&
      /\b(i|my|consumed|logged|ate|had|lower|higher)\b/.test(clean)
    )
      return true;
    if (
      /\b(i|my|me)\b/.test(clean) &&
      /\b(consumed|logged|ate|eaten|had|remaining|more|target|goal|should i take|reach my|protein have|calories have)\b/.test(
        clean,
      )
    )
      return true;
    if (
      /\b(how much more|why was yesterday lower|what did i eat|what have i eaten)\b/.test(
        clean,
      )
    )
      return true;
    return previousMode === 'personalized' && this.isReferentialFollowUp(clean);
  }

  private isReferentialFollowUp(message: string): boolean {
    return /\b(it|that|this|the previous|how much more|what about|why was .* lower|why was .* higher)\b/i.test(
      message,
    );
  }

  private contextKey(userId: string): string {
    return `cie:gemini-context:${userId}`;
  }

  private async getContext(userId: string): Promise<StoredConversationState> {
    try {
      const cached = await this.redisService.get(this.contextKey(userId));
      if (cached) {
        const parsed = JSON.parse(cached) as StoredConversationState;
        if (
          parsed.updatedAt &&
          Date.now() - parsed.updatedAt <= CONTEXT_TTL_SECONDS * 1000
        )
          return parsed;
      }
    } catch (error: any) {
      this.logger.warn(`Redis conversation read unavailable: ${error.message}`);
    }
    const memory = this.memoryContextCache.get(userId);
    if (memory && Date.now() - memory.updatedAt <= CONTEXT_TTL_SECONDS * 1000)
      return memory;
    this.memoryContextCache.delete(userId);
    return { messages: [], updatedAt: Date.now() };
  }

  private async saveContext(
    userId: string,
    state: StoredConversationState,
  ): Promise<void> {
    const bounded: StoredConversationState = {
      messages: state.messages.slice(-MAX_HISTORY_MESSAGES).map((entry) => ({
        ...entry,
        text: entry.text.slice(0, 1800),
      })),
      updatedAt: Date.now(),
    };
    this.memoryContextCache.set(userId, bounded);
    try {
      await this.redisService.set(
        this.contextKey(userId),
        JSON.stringify(bounded),
        CONTEXT_TTL_SECONDS,
      );
    } catch (error: any) {
      this.logger.warn(
        `Redis conversation write unavailable: ${error.message}`,
      );
    }
  }

  public async clearConversation(userId: string): Promise<void> {
    this.memoryContextCache.delete(userId);
    try {
      await this.redisService.del(this.contextKey(userId));
    } catch (error: any) {
      this.logger.warn(
        `Redis conversation reset unavailable: ${error.message}`,
      );
    }
  }

  private assertPersonalizedAccess(privacy: CoachPrivacyRequest): void {
    const operatorConfigured = this.isPersonalizedModeConfigured();
    const consentValid =
      privacy.personalizedConsent === true &&
      privacy.consentVersion === PERSONALIZED_GEMINI_CONSENT_VERSION;
    if (!operatorConfigured || !consentValid) {
      throw new ForbiddenException({
        code: 'PERSONALIZED_GEMINI_REQUIRED',
        message: !operatorConfigured
          ? 'Personalized AI is disabled until the operator confirms an eligible paid Gemini configuration and data-processing terms.'
          : 'Personalized AI requires your informed opt-in before nutrition records can be sent to Gemini.',
        operatorConfigured,
        consentRequired: !consentValid,
        consentVersion: PERSONALIZED_GEMINI_CONSENT_VERSION,
      });
    }
  }

  async handleCoachMessage(
    userId: string,
    message: string,
    dateStr?: string,
    timeZone?: string,
    privacy: CoachPrivacyRequest = {},
  ): Promise<{ reply: string; provenance: AiProvenance }> {
    const trimmed = message.trim();
    if (!this.isPrivacySafePrompt(trimmed)) {
      throw new BadRequestException({
        code: 'SENSITIVE_CONTENT_REJECTED',
        message:
          'Remove credentials, contact details, medical records, or other sensitive information before sending this message to Gemini.',
      });
    }

    const resolved = resolveDiaryDate(dateStr, timeZone);
    const context = await this.getContext(userId);
    const previousMode = context.messages[context.messages.length - 1]?.mode;
    const privacyMode: CoachPrivacyMode = this.hasPersonalConsumptionIntent(
      trimmed,
      previousMode,
    )
      ? 'personalized'
      : 'generic';
    if (privacyMode === 'personalized') this.assertPersonalizedAccess(privacy);

    if (context.messages.length === 0 && this.isReferentialFollowUp(trimmed)) {
      throw new BadRequestException({
        code: 'CONVERSATION_CONTEXT_EXPIRED',
        message:
          'That follow-up no longer has an active reference. Please name the food, date, or nutrient again.',
      });
    }

    // Generic mode never receives personalized turns. Personalized mode may use prior generic turns.
    const history = context.messages
      .filter(
        (entry) => privacyMode === 'personalized' || entry.mode === 'generic',
      )
      .filter((entry) => this.isPrivacySafePrompt(entry.text))
      .slice(-6)
      .map(({ role, text }) => ({ role, text }));

    const generated = await this.geminiFunctionCalling.generateCoachResponse({
      authenticatedUserId: userId,
      prompt: trimmed,
      currentDate: resolved.dateStr,
      timeZone: timeZone || 'Asia/Colombo',
      privacyMode,
      history,
    });

    await this.saveContext(userId, {
      messages: [
        ...context.messages,
        { role: 'user', text: trimmed, mode: privacyMode },
        { role: 'model', text: generated.reply, mode: privacyMode },
      ],
      updatedAt: Date.now(),
    });

    const hasRag = generated.factualSources.includes('rag_evidence');
    const hasCalTrackData = generated.factualSources.some((source) =>
      ['user_records', 'caltrack_database'].includes(source),
    );
    const source: AiProvenance['source'] = hasRag
      ? 'rag'
      : hasCalTrackData
        ? 'hybrid'
        : 'gemini';
    return {
      reply: generated.reply,
      provenance: {
        source,
        label: hasRag
          ? 'Gemini + CalTrack Evidence'
          : hasCalTrackData
            ? 'Gemini + CalTrack Data'
            : 'Gemini AI',
        details: `Generated by Gemini (${generated.modelUsed}); authoritative claims validated against supplied facts`,
        responseAuthor: 'gemini',
        factualSources: generated.factualSources,
        citations: generated.citations.map(({ title, url, provenance }) => ({
          title,
          url,
          provenance,
        })),
        personalDataMode:
          privacyMode === 'personalized' ? 'permitted' : 'not_requested',
        claimsValidated: generated.claimsValidated,
      },
    };
  }
}
