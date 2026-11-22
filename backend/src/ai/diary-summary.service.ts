import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resolveDiaryDate } from '../common/date.util';
import {
  AiProvenance,
  PROVENANCE_CALTRACK_DATA,
  PROVENANCE_CALTRACK_LOCAL,
} from './provenance.types';

export interface TodayNutritionSummary {
  dateStr: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  meals: Array<{
    slot: string;
    items: Array<{ name: string; serving: string; kcal: number }>;
    slotCalories: number;
  }>;
}

@Injectable()
export class DiarySummaryService {
  private readonly logger = new Logger(DiarySummaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Identifies questions specifically asking about today's logged food, intake, macros, or remaining calories.
   */
  public isTodayDiaryQuery(text: string): boolean {
    const clean = text.toLowerCase().trim();

    // Exclude future advice/recommendation questions (e.g. "what should i eat", "should i eat", "suggest", "can i eat")
    if (
      /^(what|what's)\s+should\s+i\s+eat/i.test(clean) ||
      /should\s+i\s+(eat|have|drink)/i.test(clean) ||
      /^(suggest|recommend|give\s+me)\s+/i.test(clean) ||
      /^can\s+i\s+(eat|have|drink)/i.test(clean) ||
      /is\s+.+\s+good\s+for/i.test(clean)
    ) {
      return false;
    }

    // 1. Direct logged meal/food queries
    if (
      /(what\s+(did\s+i|have\s+i|i)\s+(have|eat|eaten|logged|consumed|ate|had)|what\s+did\s+i\s+log)\s*(today|so far)?/i.test(clean) ||
      /(show|list|tell\s+me)\s+(what\s+i\s+(ate|had|logged|eaten)|(my\s+)?(meals|food|foods|diary|intake))\s*(today|so far)?/i.test(clean) ||
      /(what\s+are\s+my\s+meals\s+today|my\s+meals\s+today|meals\s+logged\s+today)/i.test(clean)
    ) {
      return true;
    }

    // 2. Intake & consumed totals/calories/macros queries
    if (
      /(how\s+(much\s+food|much|many)\s+(have\s+i|did\s+i|i\s+have)\s+(eat|eaten|ate|had|consumed|logged))/i.test(clean) ||
      /(what\s+(is|are|'s)\s+my\s+(total\s+)?(intake|calories|macros|nutrition))\s*(today|so far)?/i.test(clean) ||
      /(how\s+(many|much)\s+(calories|calorie|kcal|macros|macro|food)(\s+(and|&)\s+(calories|calorie|kcal|macros|macro))?\s+(have\s+i|did\s+i|i\s+have)\s+(eat|eaten|ate|had|consumed|logged))/i.test(clean) ||
      /(how\s+much\s+(protein|carbs|fat)\s+(have\s+i|did\s+i|i\s+have)\s+(eat|eaten|ate|had|consumed|logged))/i.test(clean) ||
      /(my\s+(calorie|intake|macro)\s+totals?\s*(today|so far)?)/i.test(clean) ||
      /(how\s+are\s+my\s+macros\s+today)/i.test(clean) ||
      /(total\s+intake(\s+today)?)/i.test(clean) ||
      /(macro\s+summary|nutrition\s+summary)(\s+today)?/i.test(clean)
    ) {
      return true;
    }

    // 3. Remaining calories / budget queries
    if (
      /(how\s+(many|much)\s+(calories|calorie|kcal)\s+(do\s+i\s+have\s+)?left)/i.test(clean) ||
      /(remaining\s+(calories|calorie|kcal|budget)|calories\s+remaining)/i.test(clean) ||
      /(how\s+much\s+more\s+can\s+i\s+eat(\s+today)?)/i.test(clean)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Identifies questions asking about multi-day or historical past dates.
   */
  public isHistoricalDiaryQuery(text: string): boolean {
    const clean = text.toLowerCase().trim();
    return (
      /(yesterday|last\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|in\s+(january|february|march|april|may|june|july|august|september|october|november|december))/i.test(clean) &&
      /(eat|ate|eaten|had|logged|consumed|meals|intake|calories)/i.test(clean)
    );
  }

  /**
   * Extracts a human-readable food name from a MealLogEntry record,
   * safely parsing custom combo JSON stored in unitName when foodId is null.
   */
  public extractFoodName(entry: any): string {
    if (entry.unitName && typeof entry.unitName === 'string') {
      if (entry.unitName.startsWith('{')) {
        try {
          const parsed = JSON.parse(entry.unitName);
          if (parsed.name && typeof parsed.name === 'string') {
            return parsed.name;
          }
        } catch (_) {}
      }
    }
    if (entry.food?.name) {
      return entry.food.name;
    }
    if (
      entry.unitName &&
      typeof entry.unitName === 'string' &&
      !['serving', 'servings', 'piece', 'pieces', 'cup', 'cups', 'plate', 'plates', 'portion', 'portions', 'g', 'ml'].includes(
        entry.unitName.toLowerCase(),
      )
    ) {
      return entry.unitName;
    }
    return `${entry.meal ? entry.meal.charAt(0).toUpperCase() + entry.meal.slice(1).toLowerCase() : 'Custom'} Entry`;
  }

  /**
   * Extracts human-readable serving description from entry.
   */
  public extractServingDescription(entry: any): string {
    const qty = entry.servingQuantity ?? 1;
    if (entry.unitName && typeof entry.unitName === 'string' && entry.unitName.startsWith('{')) {
      try {
        const parsed = JSON.parse(entry.unitName);
        if (parsed.ingredients && Array.isArray(parsed.ingredients) && parsed.ingredients.length > 1) {
          return `${parsed.ingredients.length} items`;
        }
      } catch (_) {}
    }
    if (entry.unitName && typeof entry.unitName === 'string' && !entry.unitName.startsWith('{')) {
      if (!entry.food && entry.unitName.length > 15) {
        return `${qty} serving${qty > 1 ? 's' : ''}`;
      }
      return `${qty} ${entry.unitName}${qty > 1 && !entry.unitName.endsWith('s') ? 's' : ''}`;
    }
    return `${qty} serving${qty > 1 ? 's' : ''}`;
  }

  /**
   * Reads diary records for the authenticated user and specified date,
   * calculating exact nutritional totals matching Home and Macro Snapshot.
   */
  public async getTodaySummary(
    userId: string,
    dateStr?: string,
    timeZone?: string,
  ): Promise<TodayNutritionSummary> {
    const { dateStr: resolvedDateStr, utcMidnightDate } = resolveDiaryDate(dateStr, timeZone);

    // 1. Fetch user targets
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        targetCalories: true,
        targetProteinG: true,
        targetCarbsG: true,
        targetFatG: true,
      },
    });

    // 2. Fetch authenticated user's diary for that date (read-only, no mutations)
    const mealLog = await this.prisma.mealLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: utcMidnightDate,
        },
      },
      include: {
        entries: {
          include: {
            food: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const entries = mealLog?.entries || [];

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const slotMap: Record<string, { items: Array<{ name: string; serving: string; kcal: number }>; calories: number }> = {
      BREAKFAST: { items: [], calories: 0 },
      LUNCH: { items: [], calories: 0 },
      DINNER: { items: [], calories: 0 },
      SNACKS: { items: [], calories: 0 },
    };

    for (const entry of entries) {
      const kcal = Math.round(entry.loggedCaloriesKcal);
      const protein = Math.round(entry.loggedProteinG);
      const carbs = Math.round(entry.loggedCarbohydratesG);
      const fat = Math.round(entry.loggedFatG);

      totalCalories += kcal;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;

      const slot = entry.meal.toUpperCase();
      if (!slotMap[slot]) {
        slotMap[slot] = { items: [], calories: 0 };
      }

      slotMap[slot].items.push({
        name: this.extractFoodName(entry),
        serving: this.extractServingDescription(entry),
        kcal,
      });
      slotMap[slot].calories += kcal;
    }

    const meals = Object.entries(slotMap)
      .filter(([_, data]) => data.items.length > 0)
      .map(([slot, data]) => ({
        slot: slot.charAt(0).toUpperCase() + slot.slice(1).toLowerCase(),
        items: data.items,
        slotCalories: data.calories,
      }));

    return {
      dateStr: resolvedDateStr,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      targetCalories: user?.targetCalories ?? null,
      targetProtein: user?.targetProteinG ?? null,
      targetCarbs: user?.targetCarbsG ?? null,
      targetFat: user?.targetFatG ?? null,
      meals,
    };
  }

  /**
   * Deterministically constructs a response to user inquiries about today's diary.
   * Eliminates LLM latency and strictly guarantees privacy without leaking diary data to third-party endpoints.
   */
  public async tryHandleCoachDiaryIntent(
    userId: string,
    message: string,
    dateStr?: string,
    timeZone?: string,
  ): Promise<{ reply: string; provenance: AiProvenance } | null> {
    // 1. Check if user is asking an unsupported multi-day historical question
    if (this.isHistoricalDiaryQuery(message)) {
      return {
        reply:
          "I can review your logged meals and macro totals for today! Detailed multi-day historical reporting is coming in V2. To inspect earlier dates, you can browse your Progress page or change the date on your Home diary.",
        provenance: {
          source: 'caltrack_local',
          label: 'CalTrack Local',
          details: 'Scope limitation notice',
        },
      };
    }

    // 2. Check if user is asking about today's logged intake
    if (!this.isTodayDiaryQuery(message)) {
      return null;
    }

    const summary = await this.getTodaySummary(userId, dateStr, timeZone);

    // Empty diary state
    if (summary.meals.length === 0) {
      return {
        reply: `You haven't logged any meals yet for today (**${summary.dateStr}**).\n\nHead over to Search or Home to log your breakfast, lunch, dinner, or snacks, and I'll keep track of your daily calories and macros!`,
        provenance: {
          source: 'caltrack_data',
          label: 'CalTrack Data',
          details: 'Authenticated PostgreSQL user records',
        },
      };
    }

    // Populated diary state
    const lines: string[] = [];
    lines.push(`Here is what you've logged today (**${summary.dateStr}**):`);
    lines.push('');

    // Nutrition Breakdown
    lines.push('**Daily Nutrition Totals:**');
    if (summary.targetCalories) {
      const remaining = summary.targetCalories - summary.totalCalories;
      const remainingText =
        remaining >= 0
          ? `${remaining.toLocaleString()} kcal remaining`
          : `${Math.abs(remaining).toLocaleString()} kcal over target`;
      lines.push(
        `* **Calories:** ${summary.totalCalories.toLocaleString()} kcal / ${summary.targetCalories.toLocaleString()} kcal target (${remainingText})`,
      );
    } else {
      lines.push(`* **Calories:** ${summary.totalCalories.toLocaleString()} kcal`);
    }

    const pTarget = summary.targetProtein ? ` / ${summary.targetProtein}g target` : '';
    const cTarget = summary.targetCarbs ? ` / ${summary.targetCarbs}g target` : '';
    const fTarget = summary.targetFat ? ` / ${summary.targetFat}g target` : '';

    lines.push(`* **Protein:** ${summary.totalProtein}g${pTarget}`);
    lines.push(`* **Carbs:** ${summary.totalCarbs}g${cTarget}`);
    lines.push(`* **Fat:** ${summary.totalFat}g${fTarget}`);
    lines.push('');

    // Meal breakdown
    lines.push('**Logged Meals:**');
    for (const meal of summary.meals) {
      const itemsList = meal.items.map((it) => `${it.name} (${it.serving})`).join(', ');
      lines.push(`* **${meal.slot}:** ${itemsList} — ${meal.slotCalories} kcal`);
    }

    lines.push('');
    lines.push("You're making great progress today! Let me know if you need meal suggestions or advice for your remaining macros.");

    return {
      reply: lines.join('\n'),
      provenance: {
        source: 'caltrack_data',
        label: 'CalTrack Data',
        details: 'Authenticated PostgreSQL user records',
      },
    };
  }
}
