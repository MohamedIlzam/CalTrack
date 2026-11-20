/**
 * CalTrack Intelligence Engine (CIE) — Synthetic Nutrition Fixtures
 *
 * Immutable, hardcoded demonstration fixtures used for safe LLM tool-calling verification.
 * Enforces zero-real-PII transmission under CalTrack's free-tier policy.
 */

export const SYNTHETIC_DEMO_USER_ID = 'synthetic-demo-user-123';

export const SYNTHETIC_TARGETS_FIXTURE = Object.freeze({
  isSyntheticDemo: true as const,
  targetCalories: 2000,
  targetProteinG: 125,
  targetCarbsG: 220,
  targetFatG: 60,
  goal: 'LOSE',
  currentWeightKg: 70.0,
  targetWeightKg: 66.0,
  heightCm: 175,
  activityLevel: 'MODERATE',
});

export const SYNTHETIC_DAILY_NUTRITION_FIXTURE = Object.freeze({
  isSyntheticDemo: true as const,
  date: '2026-11-20',
  isLogged: true,
  totalCalories: 1450,
  totalProtein: 95,
  totalCarbs: 160,
  totalFat: 48,
  meals: [
    {
      slot: 'Breakfast',
      slotCalories: 450,
      items: [
        {
          name: 'Egg Hopper with Lunu Miris',
          serving: '2 pieces',
          calories: 320,
          protein: 16,
          carbs: 36,
          fat: 12,
        },
        {
          name: 'Ceylon Milk Tea',
          serving: '1 cup',
          calories: 130,
          protein: 4,
          carbs: 18,
          fat: 5,
        },
      ],
    },
    {
      slot: 'Lunch',
      slotCalories: 1000,
      items: [
        {
          name: 'Red Rice & Chicken Curry Plate',
          serving: '1 plate',
          calories: 680,
          protein: 52,
          carbs: 72,
          fat: 22,
        },
        {
          name: 'Dhal Curry (Parippu)',
          serving: '1 cup',
          calories: 190,
          protein: 13,
          carbs: 24,
          fat: 4,
        },
        {
          name: 'Pol Sambol',
          serving: '2 tbsp',
          calories: 130,
          protein: 2,
          carbs: 4,
          fat: 10,
        },
      ],
    },
  ],
});

export const SYNTHETIC_YESTERDAY_NUTRITION_FIXTURE = Object.freeze({
  isSyntheticDemo: true as const,
  date: '2026-11-19',
  isLogged: true,
  totalCalories: 1820,
  totalProtein: 110,
  totalCarbs: 210,
  totalFat: 58,
  meals: [
    {
      slot: 'Breakfast',
      slotCalories: 420,
      items: [
        { name: 'String Hoppers with Kiri Hodi', serving: '10 pieces', calories: 420, protein: 12, carbs: 68, fat: 10 },
      ],
    },
    {
      slot: 'Lunch',
      slotCalories: 850,
      items: [
        { name: 'Yellow Rice with Fish Curry', serving: '1 plate', calories: 850, protein: 55, carbs: 90, fat: 26 },
      ],
    },
    {
      slot: 'Dinner',
      slotCalories: 550,
      items: [
        { name: 'Roast Paan with Dhal', serving: '3 slices', calories: 550, protein: 43, carbs: 52, fat: 22 },
      ],
    },
  ],
});

export const SYNTHETIC_UNLOGGED_DAY_FIXTURE = Object.freeze({
  isSyntheticDemo: true as const,
  date: '2026-11-18',
  isLogged: false,
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  meals: [],
});

export const SYNTHETIC_FOOD_HISTORY_FIXTURE = Object.freeze({
  isSyntheticDemo: true as const,
  startDate: '2026-11-14',
  endDate: '2026-11-20',
  daysRequested: 7,
  loggedDaysCount: 5,
  unloggedDaysCount: 2,
  avgDailyCalories: 1680,
  avgDailyProtein: 105,
  avgDailyCarbs: 195,
  avgDailyFat: 52,
  dailyEntries: [
    { date: '2026-11-14', isLogged: true, calories: 1750, protein: 112, carbs: 200, fat: 55, mealCount: 3, foods: ['String Hoppers', 'Chicken Curry'] },
    { date: '2026-11-15', isLogged: true, calories: 1820, protein: 115, carbs: 210, fat: 58, mealCount: 3, foods: ['Egg Hopper', 'Fish Curry'] },
    { date: '2026-11-16', isLogged: false, calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0, foods: [] },
    { date: '2026-11-17', isLogged: true, calories: 1600, protein: 98, carbs: 185, fat: 49, mealCount: 2, foods: ['Rice & Curry', 'Dhal'] },
    { date: '2026-11-18', isLogged: false, calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0, foods: [] },
    { date: '2026-11-19', isLogged: true, calories: 1820, protein: 110, carbs: 210, fat: 58, mealCount: 3, foods: ['Yellow Rice', 'Fish Curry'] },
    { date: '2026-11-20', isLogged: true, calories: 1450, protein: 95, carbs: 160, fat: 48, mealCount: 2, foods: ['Egg Hopper', 'Chicken Curry'] },
  ],
});

export const SYNTHETIC_FIXTURE_MAP = Object.freeze({
  isSyntheticDemo: true as const,
  getDailyNutrition: SYNTHETIC_DAILY_NUTRITION_FIXTURE,
  getNutritionTargets: SYNTHETIC_TARGETS_FIXTURE,
  getFoodHistory: SYNTHETIC_FOOD_HISTORY_FIXTURE,
});
