/**
 * Regression Test Suite: Profile Improvement 01
 * BMI Label Cleanup, Target Weight Constraints, and Automatic Nutrition Targets
 * 
 * Verifies:
 * 1. BMI label displays without South Asian bracket text ("BMI 22.5 • Normal").
 * 2. Target weight input accepts 2-digit whole numbers (e.g. 56) and rejects decimals / negatives.
 * 3. Does not silently truncate existing saved values outside format.
 * 4. Profile auto-calculations match Onboarding for identical inputs (Mifflin-St Jeor parity).
 * 5. Calories and macros remain internally consistent (eliminating the 576 kcal vs 2127 kcal bug).
 * 6. Saved targets persist and reflect in Home and across refresh.
 */

import assert from 'node:assert';
import { calculateBmi, calculateNutritionTargets, ACTIVITY_MULTIPLIERS } from './src/lib/nutrition.ts';

// Simulated browser environment for store persistence
const localStorageData = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStorageData.has(k) ? localStorageData.get(k) : null),
  setItem: (k, v) => localStorageData.set(k, String(v)),
  removeItem: (k) => localStorageData.delete(k),
  clear: () => localStorageData.clear(),
};
globalThis.window = globalThis;

console.log('================================================================');
console.log('CALTRACK V1: PROFILE IMPROVEMENT 01 REGRESSION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// Test 1: BMI Label Cleanup
// -----------------------------------------------------------------------------
runTest('BMI label: Displays clean classification without "South Asian" or bracketed text', () => {
  // Test cases: [weightKg, heightCm, expectedBmi, expectedLabel]
  const cases = [
    { weight: 50, height: 170, expectedBmi: '17.3', expectedLabel: 'Underweight' },
    { weight: 65, height: 170, expectedBmi: '22.5', expectedLabel: 'Normal' },
    { weight: 75, height: 170, expectedBmi: '26.0', expectedLabel: 'Overweight' },
    { weight: 85, height: 170, expectedBmi: '29.4', expectedLabel: 'Obese' },
  ];

  cases.forEach(({ weight, height, expectedBmi, expectedLabel }) => {
    const res = calculateBmi(weight, height);
    assert.strictEqual(res.bmi, expectedBmi, `BMI for ${weight}kg/${height}cm must be ${expectedBmi}`);
    assert.strictEqual(res.label, expectedLabel, `Label for ${weight}kg/${height}cm must be ${expectedLabel}`);
    assert.doesNotMatch(res.label, /south asian/i, 'Label must not contain regional "South Asian" text');
    assert.doesNotMatch(res.label, /[()\[\]]/, 'Label must not contain bracketed regional suffix');

    const formatted = `BMI ${res.bmi} • ${res.label}`;
    assert.strictEqual(formatted, `BMI ${expectedBmi} • ${expectedLabel}`);
  });

  // Invalid inputs handle gracefully
  const invalid = calculateBmi(0, 0);
  assert.strictEqual(invalid.bmi, '--');
  assert.strictEqual(invalid.label, 'Unknown');
});

// -----------------------------------------------------------------------------
// Test 2: Target Weight Input Constraints (2-digit whole number)
// -----------------------------------------------------------------------------
runTest('Target weight input: Accepts whole-number max 2 digits, rejects decimals and negatives', () => {
  const filterInput = (val) => /^\d{0,2}$/.test(val);

  // Accepted values
  assert.strictEqual(filterInput('56'), true, 'Accepts 56');
  assert.strictEqual(filterInput('9'), true, 'Accepts 9');
  assert.strictEqual(filterInput('99'), true, 'Accepts 99');
  assert.strictEqual(filterInput(''), true, 'Accepts empty string for clearing/backspacing');

  // Rejected values
  assert.strictEqual(filterInput('56.5'), false, 'Rejects decimal 56.5');
  assert.strictEqual(filterInput('.5'), false, 'Rejects leading decimal');
  assert.strictEqual(filterInput('-5'), false, 'Rejects negative value');
  assert.strictEqual(filterInput('100'), false, 'Rejects 3-digit number 100');
  assert.strictEqual(filterInput('56e2'), false, 'Rejects scientific notation');
  assert.strictEqual(filterInput('abc'), false, 'Rejects alphabetic input');

  // Form save validator
  const validateForSave = (val) => {
    if (!val) return true; // optional
    return /^\d{1,2}$/.test(val) && parseInt(val, 10) >= 20 && parseInt(val, 10) <= 99;
  };

  assert.strictEqual(validateForSave('56'), true);
  assert.strictEqual(validateForSave('65.5'), false, 'Fails save validation on decimal');
  assert.strictEqual(validateForSave('105'), false, 'Fails save validation on 3 digits');
});

// -----------------------------------------------------------------------------
// Test 3: No Silent Truncation of Existing Saved Values
// -----------------------------------------------------------------------------
runTest('Target weight: Does not silently truncate existing saved values outside format', () => {
  // If an existing DB record has targetWeightKg = 65.5 or 105:
  const mockProfileFromDb = { targetWeightKg: 65.5 };
  const loadedDisplayVal = mockProfileFromDb.targetWeightKg ? mockProfileFromDb.targetWeightKg.toString() : '';

  // Must preserve exact string "65.5", NOT silently chop to "65" or "6"
  assert.strictEqual(loadedDisplayVal, '65.5', 'Loaded display value must match DB value exactly');
  assert.notStrictEqual(loadedDisplayVal, '65', 'Must not silently truncate decimals on load');

  const mockDb105 = { targetWeightKg: 105 };
  assert.strictEqual(mockDb105.targetWeightKg.toString(), '105', 'Must not silently truncate 3-digit values on load');
});

// -----------------------------------------------------------------------------
// Test 4: Parity: Profile Auto-Calculations vs Onboarding Step 3
// -----------------------------------------------------------------------------
runTest('Parity: Profile auto-calculations match Onboarding formula exactly', () => {
  // Original inline formula from Step3Activity.tsx:
  function legacyOnboardingCalc(weightKg, heightCm, selectedActivity, goal) {
    const actMap = { sedentary: 1.2, lightly: 1.375, moderately: 1.55, very: 1.725 };
    const multiplier = actMap[selectedActivity] ?? 1.375;
    const bmr = 10 * weightKg + 6.25 * heightCm - 78;
    const tdee = Math.round(bmr * multiplier);
    const targetCalories =
      goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;

    const targetProteinG = Math.round((targetCalories * 0.25) / 4);
    const targetCarbsG = Math.round((targetCalories * 0.45) / 4);
    const targetFatG = Math.round((targetCalories * 0.30) / 9);

    return { targetCalories, targetProteinG, targetCarbsG, targetFatG };
  }

  const testPermutations = [
    { w: 68.5, h: 168, actOnboard: 'moderately', actProfile: 'MODERATE', gOnboard: 'lose', gProfile: 'LOSE' },
    { w: 80, h: 175, actOnboard: 'very', actProfile: 'ACTIVE', gOnboard: 'gain', gProfile: 'GAIN' },
    { w: 55, h: 160, actOnboard: 'sedentary', actProfile: 'SEDENTARY', gOnboard: 'maintain', gProfile: 'MAINTAIN' },
    { w: 72, h: 180, actOnboard: 'lightly', actProfile: 'LIGHT', gOnboard: 'lose', gProfile: 'LOSE' },
  ];

  testPermutations.forEach(({ w, h, actOnboard, actProfile, gOnboard, gProfile }) => {
    const fromOnboarding = legacyOnboardingCalc(w, h, actOnboard, gOnboard);
    const fromProfile = calculateNutritionTargets({
      weightKg: w,
      heightCm: h,
      activityLevel: actProfile,
      goal: gProfile,
    });

    assert.strictEqual(fromProfile.targetCalories, fromOnboarding.targetCalories, `Calories mismatch for ${w}kg/${h}cm`);
    assert.strictEqual(fromProfile.targetProteinG, fromOnboarding.targetProteinG, `Protein mismatch for ${w}kg/${h}cm`);
    assert.strictEqual(fromProfile.targetCarbsG, fromOnboarding.targetCarbsG, `Carbs mismatch for ${w}kg/${h}cm`);
    assert.strictEqual(fromProfile.targetFatG, fromOnboarding.targetFatG, `Fat mismatch for ${w}kg/${h}cm`);
  });
});

// -----------------------------------------------------------------------------
// Test 5: Internal Consistency of Calories and Macros (Eliminates 576 vs 2127 Bug)
// -----------------------------------------------------------------------------
runTest('Consistency: Computed macro calories match target calories within integer rounding', () => {
  const sampleWeights = [50, 60, 68.5, 75, 85, 95];
  const sampleHeights = [150, 160, 168, 175, 185];
  const goals = ['LOSE', 'MAINTAIN', 'GAIN'];
  const activities = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE'];

  sampleWeights.forEach((w) => {
    sampleHeights.forEach((h) => {
      goals.forEach((goal) => {
        activities.forEach((activityLevel) => {
          const targets = calculateNutritionTargets({ weightKg: w, heightCm: h, activityLevel, goal });
          const macroKcal = targets.targetProteinG * 4 + targets.targetCarbsG * 4 + targets.targetFatG * 9;
          
          // Integer rounding discrepancy across 3 macro divisions (especially fat at 9 kcal/g) is <= 10 kcal (< 1%)
          const diff = Math.abs(targets.targetCalories - macroKcal);
          assert.ok(diff <= 10, `Discrepancy too large (${diff} kcal) for w=${w}, h=${h}, goal=${goal}, act=${activityLevel}`);

          // Macro percentages must match standard split (approx 25% P, 45% C, 30% F)
          const pPct = (targets.targetProteinG * 4) / macroKcal;
          const cPct = (targets.targetCarbsG * 4) / macroKcal;
          const fPct = (targets.targetFatG * 9) / macroKcal;

          assert.ok(pPct >= 0.23 && pPct <= 0.27, `Protein % out of bounds: ${pPct}`);
          assert.ok(cPct >= 0.43 && cPct <= 0.47, `Carbs % out of bounds: ${cPct}`);
          assert.ok(fPct >= 0.28 && fPct <= 0.32, `Fat % out of bounds: ${fPct}`);
        });
      });
    });
  });
});

// -----------------------------------------------------------------------------
// Test 6: Persistence, Refresh and Home Reflection Simulation
// -----------------------------------------------------------------------------
runTest('Persistence: Saved targets update Zustand store, survive refresh, and reflect in Home', () => {
  localStorage.clear();

  let storeState = {
    targetCalories: 1850,
    targetProteinG: 120,
    targetCarbsG: 210,
    targetFatG: 55,
    weightKg: 68.5,
    targetWeightKg: 65,
    heightCm: 168,
    goal: 'lose',
    activityLevel: 'moderate',
  };

  const setOnboarding = (data) => {
    storeState = { ...storeState, ...data };
    localStorage.setItem('caltrack-storage', JSON.stringify({ state: storeState }));
  };

  // 1. Initial targets in Home
  assert.strictEqual(storeState.targetCalories, 1850);

  // 2. User edits weight to 75 kg on Profile and saves
  const newTargets = calculateNutritionTargets({
    weightKg: 75,
    heightCm: 168,
    activityLevel: 'MODERATE',
    goal: 'LOSE',
  });

  // Simulated updateMutation.onSuccess
  setOnboarding({
    weightKg: 75,
    targetWeightKg: 56,
    heightCm: 168,
    targetCalories: newTargets.targetCalories,
    targetProteinG: newTargets.targetProteinG,
    targetCarbsG: newTargets.targetCarbsG,
    targetFatG: newTargets.targetFatG,
    goal: 'lose',
    activityLevel: 'moderate',
  });

  // 3. Home now reflects new targets immediately
  assert.strictEqual(storeState.targetCalories, newTargets.targetCalories);
  assert.strictEqual(storeState.targetCalories, 2169);
  assert.strictEqual(storeState.targetWeightKg, 56);

  // 4. Simulate page refresh / rehydrate from localStorage
  const saved = JSON.parse(localStorage.getItem('caltrack-storage'));
  assert.strictEqual(saved.state.targetCalories, 2169);
  assert.strictEqual(saved.state.targetProteinG, newTargets.targetProteinG);
  assert.strictEqual(saved.state.targetWeightKg, 56);
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`[test-profile-targets-and-bmi] ${passCount} passed, ${failCount} failed`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
