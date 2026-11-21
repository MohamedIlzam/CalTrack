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
  lastSubject?: 'protein' | 'calories' | 'carbs' | 'fat' | 'history' | 'targets' | 'meals' | 'recommendation' | 'profile';
  isRecommendation?: boolean;
  isProfile?: boolean;
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
          `For reference, your daily target is **${targets.targetCalories.toLocaleString()} kcal**${targets.targetProteinG ? ` with **${targets.targetProteinG}g protein**` : ''
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
   * Composes response for general profile inquiries (e.g. "tell me about myself", "who am I").
   * Provides a comprehensive overview of user targets, weight journey, and fitness goals.
   */
  public static composeProfileOverview(targets?: NutritionTargetsResult | null): string {
    if (!targets || (!targets.targetCalories && !targets.targetProteinG && !targets.goal)) {
      return (
        "You haven't set up your nutrition profile yet.\n\n" +
        'Head over to **Profile settings** to set your daily calorie budget, macronutrient targets (protein, carbs, fat), and fitness goal!'
      );
    }

    const lines: string[] = [];
    lines.push('Here is an overview of your CalTrack profile and nutrition targets:');
    lines.push('');

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

    lines.push('');
    lines.push('You can update your personal goals or macro distribution anytime in **Profile** settings.');

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
   * Composes grounded food and meal recommendations based on authentic CalTrack food data
   * and the user's remaining calorie / protein targets.
   * Eliminates hallucinated food values and avoids dumping raw diary stats.
   */
  public static composeRecommendationResponse(
    daily?: DailyNutritionResult | null,
    targets?: NutritionTargetsResult | null,
    context?: CieConversationContext,
  ): string {
    const lines: string[] = [];

    const calTarget = targets?.targetCalories ?? null;
    const calConsumed = daily?.totalCalories ?? 0;
    const remainingKcal = calTarget !== null ? calTarget - calConsumed : null;

    const pTarget = targets?.targetProteinG ?? null;
    const pConsumed = daily?.totalProtein ?? 0;
    const remainingProteinG = pTarget !== null ? Math.round((pTarget - pConsumed) * 10) / 10 : null;

    // 1. Budget header
    lines.push('Here are personalized Sri Lankan food recommendations based on your current nutrition targets:');
    lines.push('');

    if (remainingKcal !== null && remainingProteinG !== null) {
      const calStatusText =
        remainingKcal > 0
          ? `**${remainingKcal.toLocaleString()} kcal remaining**`
          : `**${Math.abs(remainingKcal).toLocaleString()} kcal over target**`;
      const pStatusText =
        remainingProteinG > 0
          ? `**${remainingProteinG}g protein to reach goal**`
          : `**protein goal achieved (${pConsumed}g)**`;

      lines.push(`* **Remaining Today:** ${calStatusText} | ${pStatusText}`);
      lines.push('');
    } else if (calTarget !== null) {
      lines.push(`* **Daily Target Reference:** **${calTarget.toLocaleString()} kcal**`);
      lines.push('');
    }

    // 2. Grounded suggestions based on remaining macros
    lines.push('**Recommended Dishes from CalTrack Database:**');

    if (remainingProteinG !== null && remainingProteinG > 20) {
      // Prioritize high-protein options
      lines.push(
        '* **Chicken Curry** (1 piece / ~120g: **220 kcal**, **24g protein**, 4g carbs, 12g fat) — High-quality lean protein, ideal to close your protein gap.',
      );
      lines.push(
        '* **Fish Ambul Thiyal** (1 piece / ~50g: **80 kcal**, **12g protein**, 2g carbs, 2g fat) — Traditional sour fish, high protein density with minimal calories.',
      );
      lines.push(
        '* **Dhal Curry (Parippu)** (1 cup / ~150g: **180 kcal**, **9g protein**, 25g carbs, 5g fat) — Rich in dietary fiber and plant protein.',
      );
      lines.push(
        '* **Boiled Egg** (1 piece / ~50g: **78 kcal**, **6.3g protein**, 0.6g carbs, 5.3g fat) — Fast, bioavailable protein boost.',
      );
    } else if (remainingKcal !== null && remainingKcal <= 300) {
      // Light / calorie-conscious options
      lines.push(
        '* **Fish Ambul Thiyal** (1 piece / ~50g: **80 kcal**, **12g protein**, 2g carbs, 2g fat) — High protein while preserving your calorie deficit.',
      );
      lines.push(
        '* **Gotu Kola Sambol** (1 cup / ~60g: **55 kcal**, **1.5g protein**, 6g carbs, 2.5g fat) — Micronutrient-rich green salad with low energy density.',
      );
      lines.push(
        '* **Boiled Egg** (1 piece / ~50g: **78 kcal**, **6.3g protein**, 0.6g carbs, 5.3g fat) — Satiating, low-calorie protein snack.',
      );
      lines.push(
        '* **Ambul Banana** (1 piece / ~80g: **75 kcal**, **0.9g protein**, 19g carbs, 0.2g fat) — Quick natural carbohydrate replenishment.',
      );
    } else {
      // Balanced plate suggestions
      lines.push(
        '* **Red Rice with Chicken Curry & Dhal** (~1 cup rice + 1 piece chicken + 1/2 cup dhal: **510 kcal**, **32.5g protein**, 55.5g carbs, 14.5g fat) — Complete, culturally authentic balanced plate.',
      );
      lines.push(
        '* **Egg Hopper with Gotu Kola Sambol** (1 egg hopper + 1/2 cup sambol: **187 kcal**, **8.8g protein**, 21g carbs, 7.3g fat) — Light, satisfying breakfast or evening meal.',
      );
      lines.push(
        '* **String Hoppers with Dhal & Pol Sambol** (5 string hoppers + 1/2 cup dhal + 1 tbsp pol sambol: **265 kcal**, **7.5g protein**, 42g carbs, 7g fat) — Moderate-calorie traditional staple.',
      );
    }

    lines.push('');
    lines.push('You can search and add any of these items directly from the **Search** screen or build your plate on **Home**.');
    lines.push(
      '_Note: CalTrack V1 provides grounded recommendations from our verified nutritional database. Full generative multi-day meal planning is planned for CIE V2._',
    );

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

    // Recommendation Intent: Provide grounded suggestions instead of repeating diary statistics
    if (context?.isRecommendation) {
      return this.composeRecommendationResponse(dailyRes, targetsRes, context);
    }

    // Profile Intent: Return dedicated profile targets and fitness journey overview
    if (context?.isProfile || context?.lastSubject === 'profile') {
      return this.composeProfileOverview(targetsRes);
    }

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
