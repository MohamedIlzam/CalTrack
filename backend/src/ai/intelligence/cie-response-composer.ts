/**
 * CalTrack Intelligence Engine (CIE) — Response Composer
 *
 * Deterministically constructs natural, empathetic, and mathematically accurate
 * Coach answers from verified backend nutrition tools.
 * Enforces zero-hallucination and privacy by keeping real facts and calculations server-side.
 */

import {
  DailyNutritionResult,
  NutritionTargetsResult,
  FoodHistoryResult,
} from './nutrition-tools.types';
import { DispatchedToolResult } from './tool-dispatcher.service';

export interface CieConversationContext {
  lastSubject?: 'protein' | 'calories' | 'carbs' | 'fat' | 'history' | 'targets' | 'meals';
  lastDate?: string;
  updatedAt?: number;
}

export class CieResponseComposer {
  /**
   * Formats a user-friendly date label (e.g. "Friday, November 21, 2026").
   */
  public static formatDateLabel(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Composes response for daily nutrition inquiries (e.g. today or yesterday).
   */
  public static composeDailyResponse(
    daily: DailyNutritionResult,
    targets?: NutritionTargetsResult | null,
    context?: CieConversationContext,
  ): string {
    const dateFormatted = this.formatDateLabel(daily.date);

    // 1. Unlogged Day State
    if (!daily.isLogged || daily.meals.length === 0) {
      const targetLines: string[] = [];
      if (targets && targets.targetCalories) {
        targetLines.push(
          `For reference, your daily target is **${targets.targetCalories.toLocaleString()} kcal**${
            targets.targetProteinG ? ` with **${targets.targetProteinG}g protein**` : ''
          }.`,
        );
      }

      return [
        `You haven't logged any meals for **${dateFormatted}** (**${daily.date}**). Total intake is currently **0 kcal**.`,
        '',
        ...targetLines,
        'Head over to **Home** or **Search** to log your meals, and I\'ll track your calories and macros here!',
      ]
        .filter(Boolean)
        .join('\n');
    }

    // 2. Populated Day State
    const lines: string[] = [];
    const isProteinFocus = context?.lastSubject === 'protein';

    if (isProteinFocus) {
      lines.push(`Here is your protein and nutrition summary for **${dateFormatted}**:`);
    } else {
      lines.push(`Here is what you've logged for **${dateFormatted}** (**${daily.date}**):`);
    }
    lines.push('');

    // Calories line
    if (targets && targets.targetCalories) {
      const calDiff = targets.targetCalories - daily.totalCalories;
      let calStatus: string;
      if (calDiff > 0) {
        calStatus = `${calDiff.toLocaleString()} kcal remaining`;
      } else if (calDiff === 0) {
        calStatus = `daily target reached!`;
      } else {
        calStatus = `${Math.abs(calDiff).toLocaleString()} kcal over target`;
      }

      lines.push(
        `* **Calories:** **${daily.totalCalories.toLocaleString()} kcal** / ${targets.targetCalories.toLocaleString()} kcal target (${calStatus})`,
      );
    } else {
      lines.push(`* **Calories:** **${daily.totalCalories.toLocaleString()} kcal**`);
    }

    // Protein line
    if (targets && targets.targetProteinG) {
      const pDiff = targets.targetProteinG - daily.totalProtein;
      let pStatus: string;
      if (pDiff > 0) {
        pStatus = `${Math.round(pDiff * 10) / 10}g remaining`;
      } else if (pDiff === 0) {
        pStatus = `protein target reached!`;
      } else {
        pStatus = `${Math.round(Math.abs(pDiff) * 10) / 10}g over target`;
      }

      lines.push(
        `* **Protein:** **${daily.totalProtein}g** / ${targets.targetProteinG}g target (${pStatus})`,
      );
    } else {
      lines.push(`* **Protein:** **${daily.totalProtein}g**`);
    }

    // Carbs and Fat
    const cTarget = targets?.targetCarbsG ? ` / ${targets.targetCarbsG}g target` : '';
    const fTarget = targets?.targetFatG ? ` / ${targets.targetFatG}g target` : '';
    lines.push(`* **Carbs:** ${daily.totalCarbs}g${cTarget}`);
    lines.push(`* **Fat:** ${daily.totalFat}g${fTarget}`);
    lines.push('');

    // Meal breakdown
    lines.push('**Logged Meals:**');
    for (const meal of daily.meals) {
      const itemsList = meal.items.map((it) => `${it.name} (${it.serving})`).join(', ');
      lines.push(`* **${meal.slot}:** ${itemsList} — ${meal.slotCalories} kcal`);
    }

    return lines.join('\n');
  }

  /**
   * Composes response for user nutrition goals and targets inquiry.
   */
  public static composeTargetsResponse(targets: NutritionTargetsResult): string {
    const hasAnyTarget =
      targets.targetCalories !== null ||
      targets.targetProteinG !== null ||
      targets.goal !== null;

    if (!hasAnyTarget) {
      return (
        "You haven't configured your nutrition targets yet.\n\n" +
        'Head over to **Profile settings** to set your daily calorie budget, macronutrient split (protein, carbs, fat), and fitness goal!'
      );
    }

    const lines: string[] = [];
    lines.push('Here are your authoritative CalTrack nutrition goals:');
    lines.push('');

    if (targets.targetCalories) {
      lines.push(`* **Daily Calorie Target:** **${targets.targetCalories.toLocaleString()} kcal**`);
    }
    if (targets.targetProteinG) {
      lines.push(`* **Protein Target:** **${targets.targetProteinG}g**`);
    }
    if (targets.targetCarbsG) {
      lines.push(`* **Carbohydrate Target:** **${targets.targetCarbsG}g**`);
    }
    if (targets.targetFatG) {
      lines.push(`* **Healthy Fat Target:** **${targets.targetFatG}g**`);
    }
    if (targets.goal) {
      const goalDisplay =
        targets.goal === 'LOSE'
          ? 'Weight Loss (LOSE)'
          : targets.goal === 'GAIN'
          ? 'Weight / Muscle Gain (GAIN)'
          : 'Weight Maintenance (MAINTAIN)';
      lines.push(`* **Fitness Goal:** ${goalDisplay}`);
    }
    if (targets.currentWeightKg && targets.targetWeightKg) {
      lines.push(
        `* **Weight Journey:** Current **${targets.currentWeightKg} kg** (Target: **${targets.targetWeightKg} kg**)`,
      );
    }

    lines.push('');
    lines.push('You can adjust your calorie and macronutrient targets anytime in **Profile** settings.');

    return lines.join('\n');
  }

  /**
   * Composes response for multi-day food history inquiries.
   */
  public static composeHistoryResponse(
    history: FoodHistoryResult,
    targets?: NutritionTargetsResult | null,
  ): string {
    const lines: string[] = [];
    lines.push(
      `Here is your **${history.daysRequested}-day nutrition history** (${history.startDate} to ${history.endDate}):`,
    );
    lines.push('');

    lines.push(`* **Logging Consistency:** **${history.loggedDaysCount} of ${history.daysRequested} days logged** (${history.unloggedDaysCount} days unlogged)`);

    if (history.loggedDaysCount === 0) {
      lines.push('* **Average Intake:** No meals were logged during this period.');
      lines.push('');
      lines.push('Unlogged days are excluded from averages to keep your health statistics honest.');
      return lines.join('\n');
    }

    const avgCalStr = history.avgDailyCalories ? `${history.avgDailyCalories.toLocaleString()} kcal` : '—';
    const targetCalStr = targets?.targetCalories ? ` (Target: ${targets.targetCalories.toLocaleString()} kcal)` : '';
    lines.push(`* **Average Daily Calories:** **${avgCalStr}** / logged day${targetCalStr}`);

    const avgPStr = history.avgDailyProtein ? `${history.avgDailyProtein}g` : '—';
    const targetPStr = targets?.targetProteinG ? ` (Target: ${targets.targetProteinG}g)` : '';
    lines.push(`* **Average Daily Protein:** **${avgPStr}** / logged day${targetPStr}`);

    if (history.avgDailyCarbs) {
      lines.push(`* **Average Daily Carbs:** ${history.avgDailyCarbs}g / logged day`);
    }
    if (history.avgDailyFat) {
      lines.push(`* **Average Daily Fat:** ${history.avgDailyFat}g / logged day`);
    }

    lines.push('');
    lines.push('**Day-by-Day Overview:**');
    for (const day of history.dailyEntries) {
      if (day.isLogged) {
        const topFoods = day.foods.slice(0, 3).join(', ');
        const foodsText = topFoods ? ` — ${topFoods}${day.foods.length > 3 ? '...' : ''}` : '';
        lines.push(
          `* **${day.date}:** ${day.calories.toLocaleString()} kcal (${day.protein}g Protein)${foodsText}`,
        );
      } else {
        lines.push(`* **${day.date}:** *No meals logged*`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Composes unified multi-tool answer when multiple tools were called in a single turn.
   * Directly solves combined questions (e.g. "How much protein do I still need today?").
   */
  public static composeCombinedResponse(
    toolResults: DispatchedToolResult[],
    context?: CieConversationContext,
  ): string {
    const dailyRes = toolResults.find((r) => r.tool === 'getDailyNutrition' && r.success)?.data as
      | DailyNutritionResult
      | undefined;
    const targetsRes = toolResults.find((r) => r.tool === 'getNutritionTargets' && r.success)?.data as
      | NutritionTargetsResult
      | undefined;
    const historyRes = toolResults.find((r) => r.tool === 'getFoodHistory' && r.success)?.data as
      | FoodHistoryResult
      | undefined;

    // Check for combined: Daily + Targets (e.g. remaining calories or remaining protein)
    if (dailyRes && targetsRes) {
      const lines: string[] = [];
      const isProteinQuery = context?.lastSubject === 'protein';

      if (isProteinQuery && targetsRes.targetProteinG) {
        const pConsumed = dailyRes.totalProtein;
        const pTarget = targetsRes.targetProteinG;
        const pDiff = pTarget - pConsumed;

        if (pDiff > 0) {
          lines.push(
            `You need **${Math.round(pDiff * 10) / 10}g more protein** to hit your daily goal today (**${this.formatDateLabel(dailyRes.date)}**).`,
          );
        } else if (pDiff === 0) {
          lines.push(
            `You've reached your exact protein goal of **${pTarget}g** for today!`,
          );
        } else {
          lines.push(
            `You've already surpassed your protein goal by **${Math.round(Math.abs(pDiff) * 10) / 10}g** today (${pConsumed}g consumed vs ${pTarget}g target)!`,
          );
        }
        lines.push('');
      } else if (targetsRes.targetCalories) {
        const calConsumed = dailyRes.totalCalories;
        const calTarget = targetsRes.targetCalories;
        const calDiff = calTarget - calConsumed;

        if (calDiff > 0) {
          lines.push(
            `You have **${calDiff.toLocaleString()} kcal remaining** for today (**${this.formatDateLabel(dailyRes.date)}**).`,
          );
        } else if (calDiff === 0) {
          lines.push(
            `You've reached your exact calorie target of **${calTarget.toLocaleString()} kcal** for today!`,
          );
        } else {
          lines.push(
            `You are **${Math.abs(calDiff).toLocaleString()} kcal over your target** today (${calConsumed.toLocaleString()} kcal consumed vs ${calTarget.toLocaleString()} kcal target).`,
          );
        }
        lines.push('');
      }

      // Append standard daily breakdown with targets
      lines.push(this.composeDailyResponse(dailyRes, targetsRes, context));
      return lines.join('\n');
    }

    if (historyRes) {
      return this.composeHistoryResponse(historyRes, targetsRes);
    }

    if (dailyRes) {
      return this.composeDailyResponse(dailyRes, targetsRes, context);
    }

    if (targetsRes) {
      return this.composeTargetsResponse(targetsRes);
    }

    // Fallback for failed tools
    const failed = toolResults.filter((r) => !r.success);
    if (failed.length > 0) {
      return `I encountered an issue retrieving your nutrition information: ${failed[0].error || 'Tool execution failed'}. Please check your diary on Home or try again.`;
    }

    return 'I could not retrieve your nutrition records at this time. Please check your diary on Home.';
  }
}
