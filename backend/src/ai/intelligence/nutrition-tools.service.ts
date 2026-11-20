import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DiarySummaryService } from '../diary-summary.service';
import { getLocalDateString, parseLocalDate } from '../../common/date.util';
import {
  GetDailyNutritionArgs,
  DailyNutritionResult,
  MealSlotNutrition,
  MealItemDetail,
  NutritionTargetsResult,
  GetFoodHistoryArgs,
  FoodHistoryResult,
  DailyHistoryEntry,
} from './nutrition-tools.types';

@Injectable()
export class NutritionToolsService {
  private readonly logger = new Logger(NutritionToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly diarySummaryService: DiarySummaryService,
  ) {}

  /**
   * Validates that an authenticated server-side userId is provided.
   * Prevents LLM tool arguments from spoofing user identities.
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      throw new UnauthorizedException('Valid authenticated userId is required');
    }
  }

  /**
   * Validates calendar date string format (YYYY-MM-DD) and calendar boundary correctness.
   * Rejects malformed dates, invalid months, and non-existent days (e.g. 2026-02-31).
   */
  public validateDateString(dateStr: any): string {
    if (!dateStr || typeof dateStr !== 'string') {
      throw new BadRequestException('date parameter must be a string in YYYY-MM-DD format');
    }
    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException('date must be in valid YYYY-MM-DD format');
    }
    const [_, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (month < 1 || month > 12) {
      throw new BadRequestException(`Invalid month "${monthStr}" in date`);
    }

    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > daysInMonth) {
      throw new BadRequestException(
        `Invalid day "${dayStr}" for month ${monthStr} (max ${daysInMonth})`,
      );
    }

    return `${yearStr}-${monthStr}-${dayStr}`;
  }

  /**
   * Validates that the history window is an integer within the allowable bounds (1 to 7 for V1).
   */
  public validateDaysLimit(days: any): number {
    const numericDays = typeof days === 'number' ? days : parseInt(days, 10);
    if (isNaN(numericDays) || !Number.isInteger(numericDays)) {
      throw new BadRequestException('days parameter must be an integer');
    }
    if (numericDays < 1 || numericDays > 7) {
      throw new BadRequestException(
        'days must be an integer between 1 and 7 for V1 history retrieval',
      );
    }
    return numericDays;
  }

  /**
   * Tool 1: getDailyNutrition(date)
   *
   * Retrieves verified nutritional intake for a specific calendar date.
   * Read-only; isolates data strictly to the authenticated user.
   */
  async getDailyNutrition(
    userId: string,
    args: GetDailyNutritionArgs,
  ): Promise<DailyNutritionResult> {
    this.validateUserId(userId);
    const validDate = this.validateDateString(args?.date);
    const utcDate = parseLocalDate(validDate);

    // Read-only query using compound index [userId, date]
    const mealLog = await this.prisma.mealLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: utcDate,
        },
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const entries = mealLog?.entries || [];

    // Distinct unlogged day state
    if (entries.length === 0) {
      return {
        date: validDate,
        isLogged: false,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: [],
      };
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const slotMap: Record<string, { items: MealItemDetail[]; slotCalories: number }> = {
      BREAKFAST: { items: [], slotCalories: 0 },
      LUNCH: { items: [], slotCalories: 0 },
      DINNER: { items: [], slotCalories: 0 },
      SNACKS: { items: [], slotCalories: 0 },
    };

    for (const entry of entries) {
      const kcal = Math.round(entry.loggedCaloriesKcal);
      const protein = Math.round(entry.loggedProteinG * 10) / 10;
      const carbs = Math.round(entry.loggedCarbohydratesG * 10) / 10;
      const fat = Math.round(entry.loggedFatG * 10) / 10;

      totalCalories += kcal;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;

      const rawSlot = (entry.meal || 'SNACKS').toUpperCase();
      if (!slotMap[rawSlot]) {
        slotMap[rawSlot] = { items: [], slotCalories: 0 };
      }

      slotMap[rawSlot].items.push({
        name: this.diarySummaryService.extractFoodName(entry),
        serving: this.diarySummaryService.extractServingDescription(entry),
        calories: kcal,
        protein,
        carbs,
        fat,
      });
      slotMap[rawSlot].slotCalories += kcal;
    }

    const meals: MealSlotNutrition[] = Object.entries(slotMap)
      .filter(([_, data]) => data.items.length > 0)
      .map(([slot, data]) => ({
        slot: slot.charAt(0).toUpperCase() + slot.slice(1).toLowerCase(),
        slotCalories: data.slotCalories,
        items: data.items,
      }));

    return {
      date: validDate,
      isLogged: true,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      meals,
    };
  }

  /**
   * Tool 2: getNutritionTargets()
   *
   * Retrieves the authenticated user's authoritative nutrition goals and targets.
   * Strictly read-only; never exposes email, passwordHash, tokens, or system identifiers.
   */
  async getNutritionTargets(userId: string): Promise<NutritionTargetsResult> {
    this.validateUserId(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetCalories: true,
        targetProteinG: true,
        targetCarbsG: true,
        targetFatG: true,
        goal: true,
        weightKg: true,
        targetWeightKg: true,
        heightCm: true,
        activityLevel: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    return {
      targetCalories: user.targetCalories ?? null,
      targetProteinG: user.targetProteinG ?? null,
      targetCarbsG: user.targetCarbsG ?? null,
      targetFatG: user.targetFatG ?? null,
      goal: user.goal ? String(user.goal) : null,
      currentWeightKg: user.weightKg ?? null,
      targetWeightKg: user.targetWeightKg ?? null,
      heightCm: user.heightCm ?? null,
      activityLevel: user.activityLevel ? String(user.activityLevel) : null,
    };
  }

  /**
   * Tool 3: getFoodHistory(days, endDate?)
   *
   * Retrieves bounded multi-day historical nutrition and food items (up to 7 days for V1).
   * Distinguishes logged from unlogged calendar days.
   * Averages are calculated strictly across logged days (unlogged days are not treated as 0 kcal fasts).
   */
  async getFoodHistory(
    userId: string,
    args: GetFoodHistoryArgs,
  ): Promise<FoodHistoryResult> {
    this.validateUserId(userId);
    const daysLimit = this.validateDaysLimit(args?.days);

    const endDateStr = args?.endDate
      ? this.validateDateString(args.endDate)
      : getLocalDateString();
    const endDateUtc = parseLocalDate(endDateStr);

    const startDateUtc = new Date(endDateUtc);
    startDateUtc.setUTCDate(startDateUtc.getUTCDate() - daysLimit + 1);
    const startDateStr = startDateUtc.toISOString().split('T')[0];

    const logs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDateUtc,
          lte: endDateUtc,
        },
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    const dailyEntries: DailyHistoryEntry[] = [];
    let sumKcal = 0;
    let sumP = 0;
    let sumC = 0;
    let sumF = 0;
    let loggedDaysCount = 0;

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(endDateUtc);
      d.setUTCDate(d.getUTCDate() - i);
      const dateString = d.toISOString().split('T')[0];

      const log = logs.find((l) => l.date.toISOString().split('T')[0] === dateString);

      if (log && log.entries.length > 0) {
        loggedDaysCount++;
        const kcal = Math.round(log.entries.reduce((sum, e) => sum + e.loggedCaloriesKcal, 0));
        const protein =
          Math.round(log.entries.reduce((sum, e) => sum + e.loggedProteinG, 0) * 10) / 10;
        const carbs =
          Math.round(log.entries.reduce((sum, e) => sum + e.loggedCarbohydratesG, 0) * 10) / 10;
        const fat =
          Math.round(log.entries.reduce((sum, e) => sum + e.loggedFatG, 0) * 10) / 10;

        sumKcal += kcal;
        sumP += protein;
        sumC += carbs;
        sumF += fat;

        // Distinct food names
        const foodNameSet = new Set<string>();
        for (const entry of log.entries) {
          foodNameSet.add(this.diarySummaryService.extractFoodName(entry));
        }

        dailyEntries.push({
          date: dateString,
          isLogged: true,
          calories: kcal,
          protein,
          carbs,
          fat,
          mealCount: log.entries.length,
          foods: Array.from(foodNameSet),
        });
      } else {
        dailyEntries.push({
          date: dateString,
          isLogged: false,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
          foods: [],
        });
      }
    }

    const unloggedDaysCount = daysLimit - loggedDaysCount;

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      daysRequested: daysLimit,
      loggedDaysCount,
      unloggedDaysCount,
      avgDailyCalories: loggedDaysCount > 0 ? Math.round(sumKcal / loggedDaysCount) : null,
      avgDailyProtein:
        loggedDaysCount > 0 ? Math.round((sumP / loggedDaysCount) * 10) / 10 : null,
      avgDailyCarbs:
        loggedDaysCount > 0 ? Math.round((sumC / loggedDaysCount) * 10) / 10 : null,
      avgDailyFat:
        loggedDaysCount > 0 ? Math.round((sumF / loggedDaysCount) * 10) / 10 : null,
      dailyEntries,
    };
  }
}
