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
  CatalogFoodResult,
  FoodCatalogLookupResult,
  WeightProgressResult,
  MealPatternResult,
  CatalogRecommendationResult,
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
   * Validates that the summary window is bounded to 30 calendar days for V1.
   */
  public validateDaysLimit(days: any): number {
    const numericDays = typeof days === 'number' ? days : parseInt(days, 10);
    if (isNaN(numericDays) || !Number.isInteger(numericDays)) {
      throw new BadRequestException('days parameter must be an integer');
    }
    if (numericDays < 1 || numericDays > 30) {
      throw new BadRequestException(
        'days must be an integer between 1 and 30 for V1 summary retrieval',
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

  private toCatalogFood(food: any): CatalogFoodResult {
    const standardUnit =
      food.unitConversions?.find((unit: any) => unit.isStandard) || food.unitConversions?.[0];
    const servingGrams = standardUnit?.gramEquivalent || 100;
    const multiplier = servingGrams / 100;
    return {
      id: food.id,
      name: food.name,
      category: food.category,
      isVerified: Boolean(food.isVerified),
      servingDescription: standardUnit ? `1 ${standardUnit.unitName}` : '100g',
      servingGrams: Math.round(servingGrams * 10) / 10,
      calories: Math.round(food.caloriesKcal * multiplier),
      protein: Math.round(food.proteinG * multiplier * 10) / 10,
      carbs: Math.round(food.carbohydratesG * multiplier * 10) / 10,
      fat: Math.round(food.fatG * multiplier * 10) / 10,
    };
  }

  /** Public food-catalog data. Authentication is still required by the dispatcher for a uniform boundary. */
  async lookupFoods(userId: string, args: { query: string; limit?: number }): Promise<FoodCatalogLookupResult> {
    this.validateUserId(userId);
    const query = typeof args?.query === 'string' ? args.query.trim() : '';
    if (!query || query.length > 120) {
      throw new BadRequestException('query must be between 1 and 120 characters');
    }
    const limit = Math.min(Math.max(Number(args?.limit) || 5, 1), 8);
    const foods = await this.prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { aliases: { some: { aliasName: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      include: { unitConversions: true },
      orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
      take: limit,
    });
    return { query, foods: foods.map((food) => this.toCatalogFood(food)) };
  }

  async getWeightProgress(userId: string, args: { days?: number }): Promise<WeightProgressResult> {
    this.validateUserId(userId);
    const days = Math.min(Math.max(Number(args?.days) || 90, 1), 365);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    const entries = await this.prisma.weightEntry.findMany({
      where: { userId, recordedAt: { gte: since } },
      select: { recordedAt: true, weightKg: true },
      orderBy: { recordedAt: 'asc' },
      take: 366,
    });
    const first = entries[0]?.weightKg ?? null;
    const latest = entries[entries.length - 1]?.weightKg ?? null;
    return {
      days,
      entries: entries.map((entry) => ({ recordedAt: entry.recordedAt.toISOString(), weightKg: entry.weightKg })),
      firstWeightKg: first,
      latestWeightKg: latest,
      changeKg: first !== null && latest !== null ? Math.round((latest - first) * 10) / 10 : null,
    };
  }

  async getMealPatterns(userId: string, args: { days?: number }): Promise<MealPatternResult> {
    this.validateUserId(userId);
    const days = Math.min(Math.max(Number(args?.days) || 30, 1), 30);
    const endDate = parseLocalDate(getLocalDateString());
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - days + 1);
    const logs = await this.prisma.mealLog.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { entries: { include: { food: true } } },
      orderBy: { date: 'asc' },
    });
    const foodCounts = new Map<string, number>();
    const slotCounts = new Map<string, number>();
    let loggedDaysCount = 0;
    for (const log of logs) {
      if (log.entries.length > 0) loggedDaysCount++;
      for (const entry of log.entries) {
        const name = this.diarySummaryService.extractFoodName(entry);
        foodCounts.set(name, (foodCounts.get(name) || 0) + 1);
        const slot = String(entry.meal);
        slotCounts.set(slot, (slotCounts.get(slot) || 0) + 1);
      }
    }
    const descending = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0]);
    return {
      days,
      loggedDaysCount,
      commonFoods: Array.from(foodCounts.entries()).sort(descending).slice(0, 8).map(([name, occurrences]) => ({ name, occurrences })),
      mealSlotCounts: Array.from(slotCounts.entries()).sort(descending).map(([slot, entries]) => ({ slot, entries })),
    };
  }

  async getFoodRecommendations(
    userId: string,
    args: { maxCalories?: number; proteinPriority?: boolean; limit?: number },
  ): Promise<CatalogRecommendationResult> {
    this.validateUserId(userId);
    const maxCaloriesRaw = Number(args?.maxCalories);
    const maxCalories = Number.isFinite(maxCaloriesRaw) && maxCaloriesRaw > 0 ? Math.min(maxCaloriesRaw, 2500) : null;
    const proteinPriority = Boolean(args?.proteinPriority);
    const limit = Math.min(Math.max(Number(args?.limit) || 4, 1), 6);
    const foods = await this.prisma.food.findMany({
      where: { regionId: 'LK' },
      include: { unitConversions: true },
      orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
      take: 150,
    });
    const candidates = foods
      .map((food) => this.toCatalogFood(food))
      .filter((food) => food.calories > 0 && (!maxCalories || food.calories <= maxCalories))
      .sort((a, b) => {
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        if (proteinPriority) {
          const aDensity = a.protein / Math.max(a.calories, 1);
          const bDensity = b.protein / Math.max(b.calories, 1);
          if (aDensity !== bDensity) return bDensity - aDensity;
        }
        return a.calories - b.calories;
      })
      .slice(0, limit);
    return {
      maxCalories,
      proteinPriority,
      foods: candidates,
      basis: candidates.length > 0 && candidates.every((food) => food.isVerified) ? 'verified_catalog' : 'catalog',
    };
  }
}
