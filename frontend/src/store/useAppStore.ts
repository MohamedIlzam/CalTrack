import { create } from "zustand";

/* ─────────────── Types ─────────────── */

export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodEntry {
  id: string;
  name: string;
  kcal: number;
  carbs: number;   // grams
  protein: number; // grams
  fat: number;     // grams
  serving: string; // e.g. "1 piece", "2 tbsp"
  meal: MealSlot;
}

/* ─────────────── Onboarding slice ─────────────── */

interface OnboardingState {
  name: string;
  goal: Goal;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

/* ─────────────── Daily log slice ─────────────── */

interface DailyLogState {
  entries: FoodEntry[];
}

/* ─────────────── Actions ─────────────── */

interface Actions {
  setOnboarding: (data: Partial<OnboardingState>) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
}

/* ─────────────── Store ─────────────── */

interface AppStore extends OnboardingState, DailyLogState, Actions {}

export const useAppStore = create<AppStore>((set) => ({
  // Onboarding defaults
  name: "",
  goal: "lose",
  weightKg: 0,
  heightCm: 0,
  activityLevel: "sedentary",
  targetCalories: 0,
  targetProteinG: 0,
  targetCarbsG: 0,
  targetFatG: 0,

  // Daily log defaults
  entries: [],

  // Actions
  setOnboarding: (data) => set((state) => ({ ...state, ...data })),

  addFoodEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),

  removeFoodEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
}));

/* ─────────────── Derived selectors ─────────────── */

/** Total consumed kcal across all meals today */
export const selectConsumedKcal = (s: AppStore) =>
  s.entries.reduce((sum, e) => sum + e.kcal, 0);

/** Consumed kcal per meal slot */
export const selectKcalByMeal = (meal: MealSlot) => (s: AppStore) =>
  s.entries
    .filter((e) => e.meal === meal)
    .reduce((sum, e) => sum + e.kcal, 0);

/** Entries for a specific meal */
export const selectEntriesByMeal = (meal: MealSlot) => (s: AppStore) =>
  s.entries.filter((e) => e.meal === meal);
