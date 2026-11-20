/**
 * Authoritative Nutrition & Health Calculations for CalTrack V1
 * Shared between Onboarding and Profile Management.
 */

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  lightly: 1.375,
  moderate: 1.55,
  moderately: 1.55,
  active: 1.725,
  very: 1.725,
};

export interface NutritionTargets {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

/**
 * Calculates daily calorie and macronutrient targets based on Mifflin-St Jeor formula.
 * Exact formula used across Onboarding Step 3 and Profile.
 */
export function calculateNutritionTargets({
  weightKg,
  heightCm,
  activityLevel,
  goal,
}: {
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: string;
}): NutritionTargets {
  const normActivity = (activityLevel || "moderate").toLowerCase();
  const normGoal = (goal || "lose").toLowerCase();

  const multiplier = ACTIVITY_MULTIPLIERS[normActivity] ?? 1.375;

  // Mifflin-St Jeor (gender-neutral midpoint: -78 offset)
  const bmr = 10 * weightKg + 6.25 * heightCm - 78;
  const tdee = Math.round(bmr * multiplier);

  const targetCalories =
    normGoal === "lose" ? tdee - 500 : normGoal === "gain" ? tdee + 300 : tdee;

  // Standard macronutrient distribution: 25% Protein, 45% Carbs, 30% Fat
  const targetProteinG = Math.round((targetCalories * 0.25) / 4);
  const targetCarbsG = Math.round((targetCalories * 0.45) / 4);
  const targetFatG = Math.round((targetCalories * 0.30) / 9);

  return {
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

export interface BmiResult {
  bmi: string;
  label: "Underweight" | "Normal" | "Overweight" | "Obese" | "Unknown";
  color: string;
  numericBmi: number | null;
}

/**
 * Calculates BMI and standard classification without regional label suffixes.
 * Thresholds: <18.5 Underweight, <23.0 Normal, <27.5 Overweight, >=27.5 Obese.
 */
export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (isNaN(weightKg) || isNaN(heightCm) || heightCm <= 0 || weightKg <= 0) {
    return { bmi: "--", label: "Unknown", color: "text-gray-400", numericBmi: null };
  }
  const h = heightCm / 100;
  const bmiVal = (weightKg / (h * h)).toFixed(1);
  const numericBmi = parseFloat(bmiVal);

  if (numericBmi < 18.5) {
    return { bmi: bmiVal, label: "Underweight", color: "text-blue-500", numericBmi };
  }
  if (numericBmi < 23.0) {
    return { bmi: bmiVal, label: "Normal", color: "text-emerald-500", numericBmi };
  }
  if (numericBmi < 27.5) {
    return { bmi: bmiVal, label: "Overweight", color: "text-amber-500", numericBmi };
  }
  return { bmi: bmiVal, label: "Obese", color: "text-rose-500", numericBmi };
}
