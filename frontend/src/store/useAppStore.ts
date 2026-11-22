import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────────── Types ─────────────── */

export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type MealSlot =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "snacks"
  | "saved_meals";

export interface SubIngredient {
  id: string;
  name: string;
  qty: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  kcal: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  serving: string; // e.g. "1 piece", "2 tbsp"
  meal: MealSlot;
  qty?: number;
  ingredients?: SubIngredient[];
}

/* ─────────────── Onboarding slice ─────────────── */

export interface OnboardingState {
  hasOnboarded: boolean;
  name: string;
  goal: Goal;
  weightKg: number;
  targetWeightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  token: string | null;
  email: string | null;
}

/* ─────────────── Daily log slice ─────────────── */

interface DailyLogState {
  entries: FoodEntry[];
}

/* ─────────────── AI Coach chat slice ─────────────── */

export interface CoachChatMessage {
  id: string;
  role: "user" | "coach" | "error";
  content: string;
  timestamp: string;
  card?: "daily-summary" | null;
  provenance?: {
    source:
      | "gemini"
      | "caltrack_data"
      | "caltrack_local"
      | "local_fallback"
      | "rag"
      | "hybrid";
    label: string;
    details?: string;
    responseAuthor?: "gemini" | "caltrack_local";
    factualSources?: string[];
    citations?: Array<{ title: string; url: string; provenance?: string }>;
    personalDataMode?: "not_requested" | "permitted" | "blocked";
    claimsValidated?: boolean;
  };
  errorDetails?: {
    errorMessage: string;
    lastPrompt: string;
  };
}

interface CoachChatState {
  coachMessages: CoachChatMessage[];
  personalizedAiConsent: boolean;
}

/* ─────────────── Actions ─────────────── */

interface Actions {
  setOnboarding: (data: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  addFoodEntry: (entry: FoodEntry) => void;
  updateFoodEntry: (id: string, updated: Partial<FoodEntry>) => void;
  removeFoodEntry: (id: string) => void;
  clearEntries: () => void;
  setCoachMessages: (
    messages:
      | CoachChatMessage[]
      | ((prev: CoachChatMessage[]) => CoachChatMessage[]),
  ) => void;
  clearCoachMessages: () => void;
  setPersonalizedAiConsent: (enabled: boolean) => void;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

/* ─────────────── Store ─────────────── */

interface AppStore
  extends OnboardingState, DailyLogState, CoachChatState, Actions {}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Onboarding defaults
      hasOnboarded: false,
      name: "",
      goal: "lose",
      weightKg: 0,
      targetWeightKg: 0,
      heightCm: 0,
      activityLevel: "sedentary",
      targetCalories: 0,
      targetProteinG: 0,
      targetCarbsG: 0,
      targetFatG: 0,
      token: null,
      email: null,

      // Daily log defaults
      entries: [],

      // AI Coach chat defaults
      coachMessages: [],
      personalizedAiConsent: false,

      // Actions
      setOnboarding: (data) => set((state) => ({ ...state, ...data })),

      completeOnboarding: () => set({ hasOnboarded: true }),

      addFoodEntry: (entry) =>
        set((state) => ({ entries: [...state.entries, entry] })),

      updateFoodEntry: (id, updated) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updated } : e,
          ),
        })),

      removeFoodEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      clearEntries: () => set({ entries: [] }),

      setCoachMessages: (messages) =>
        set((state) => ({
          coachMessages:
            typeof messages === "function"
              ? messages(state.coachMessages)
              : messages,
        })),

      clearCoachMessages: () => set({ coachMessages: [] }),
      setPersonalizedAiConsent: (enabled) =>
        set({ personalizedAiConsent: enabled }),

      setAuth: (token, user) =>
        set((state) => {
          const isDifferentUser = !state.email || state.email !== user.email;
          return {
            ...state,
            token,
            email: user.email,
            name: user.name,
            goal: user.goal ? (user.goal.toLowerCase() as Goal) : state.goal,
            weightKg: user.weightKg || state.weightKg,
            targetWeightKg: user.targetWeightKg || state.targetWeightKg,
            heightCm: user.heightCm || state.heightCm,
            activityLevel: user.activityLevel
              ? (user.activityLevel.toLowerCase() as ActivityLevel)
              : state.activityLevel,
            targetCalories: user.targetCalories || state.targetCalories,
            targetProteinG: user.targetProteinG || state.targetProteinG,
            targetCarbsG: user.targetCarbsG || state.targetCarbsG,
            targetFatG: user.targetFatG || state.targetFatG,
            hasOnboarded: true,
            entries: isDifferentUser ? [] : state.entries,
            coachMessages: isDifferentUser ? [] : state.coachMessages,
            personalizedAiConsent: isDifferentUser
              ? false
              : state.personalizedAiConsent,
          };
        }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({
          hasOnboarded: false,
          name: "",
          email: null,
          token: null,
          goal: "lose",
          weightKg: 0,
          targetWeightKg: 0,
          heightCm: 0,
          activityLevel: "sedentary",
          targetCalories: 0,
          targetProteinG: 0,
          targetCarbsG: 0,
          targetFatG: 0,
          entries: [],
          coachMessages: [],
          personalizedAiConsent: false,
        });
      },
    }),
    {
      name: "caltrack-storage",
    },
  ),
);

/* ─────────────── Derived selectors ─────────────── */

/** Total consumed kcal across all meals today */
export const selectConsumedKcal = (s: AppStore) =>
  s.entries
    .filter((e) => e.meal !== "saved_meals")
    .reduce((sum, e) => sum + e.kcal, 0);

/** Consumed kcal per meal slot */
export const selectKcalByMeal = (meal: MealSlot) => (s: AppStore) =>
  s.entries.filter((e) => e.meal === meal).reduce((sum, e) => sum + e.kcal, 0);

/** Entries for a specific meal */
export const selectEntriesByMeal = (meal: MealSlot) => (s: AppStore) =>
  s.entries.filter((e) => e.meal === meal);
