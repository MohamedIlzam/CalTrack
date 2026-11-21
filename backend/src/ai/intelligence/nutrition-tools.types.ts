/**
 * CalTrack Intelligence Engine (CIE) — Read-Only Nutrition Tools Types
 *
 * Strongly-typed contracts for internal tool execution, designed for seamless
 * mapping to Gemini Function Calling declarations in subsequent implementations.
 */

export interface GetDailyNutritionArgs {
  date: string; // ISO calendar date YYYY-MM-DD
}

export interface MealItemDetail {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSlotNutrition {
  slot: string; // e.g. "Breakfast" | "Lunch" | "Dinner" | "Snacks"
  slotCalories: number;
  items: MealItemDetail[];
}

export interface DailyNutritionResult {
  date: string; // YYYY-MM-DD
  isLogged: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealSlotNutrition[];
}

export interface NutritionTargetsResult {
  targetCalories: number | null;
  targetProteinG: number | null;
  targetCarbsG: number | null;
  targetFatG: number | null;
  goal: string | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  heightCm: number | null;
  activityLevel: string | null;
}

export interface GetFoodHistoryArgs {
  days: number; // Integer between 1 and 30 (bounded V1 summary window)
  endDate?: string; // Optional reference end date YYYY-MM-DD (defaults to local today)
}

export interface CatalogFoodResult {
  id: string;
  name: string;
  category: string;
  isVerified: boolean;
  servingDescription: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodCatalogLookupResult {
  query: string;
  foods: CatalogFoodResult[];
}

export interface WeightProgressResult {
  days: number;
  entries: Array<{ recordedAt: string; weightKg: number }>;
  firstWeightKg: number | null;
  latestWeightKg: number | null;
  changeKg: number | null;
}

export interface MealPatternResult {
  days: number;
  loggedDaysCount: number;
  commonFoods: Array<{ name: string; occurrences: number }>;
  mealSlotCounts: Array<{ slot: string; entries: number }>;
}

export interface CatalogRecommendationResult {
  maxCalories: number | null;
  proteinPriority: boolean;
  foods: CatalogFoodResult[];
  basis: 'verified_catalog' | 'catalog';
}

export interface DailyHistoryEntry {
  date: string;
  isLogged: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  foods: string[];
}

export interface FoodHistoryResult {
  startDate: string;
  endDate: string;
  daysRequested: number;
  loggedDaysCount: number;
  unloggedDaysCount: number;
  avgDailyCalories: number | null;
  avgDailyProtein: number | null;
  avgDailyCarbs: number | null;
  avgDailyFat: number | null;
  dailyEntries: DailyHistoryEntry[];
}
