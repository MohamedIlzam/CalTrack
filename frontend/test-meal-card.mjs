import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure compiled MealPlateCard exists locally
const distTestDir = path.join(__dirname, 'dist-test');
try {
  execSync(
    'node ./node_modules/typescript/bin/tsc src/components/meal/MealPlateCard.tsx --jsx react-jsx --module nodenext --moduleResolution nodenext --target es2022 --outDir ./dist-test',
    { cwd: __dirname, stdio: 'pipe' }
  );
} catch (e) {
  console.error('Failed to compile MealPlateCard for test:', e);
}

const { MealPlateCard } = await import('./dist-test/MealPlateCard.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('CALTRACK PHASE 2C: MEAL PLATE CARD AUTOMATED COMPONENT TEST');
console.log('================================================================\n');

// ── Test 1: Empty items returns empty output ──────────────────────────────────
console.log('Test 1: Empty state handling');
{
  const html = renderToStaticMarkup(React.createElement(MealPlateCard, { items: [] }));
  assert(html === '', 'Empty items array returns null / empty string');

  const htmlUndefined = renderToStaticMarkup(React.createElement(MealPlateCard, { items: undefined }));
  assert(htmlUndefined === '', 'Undefined items array returns null / empty string');
}

// ── Test 2: Multi-item rendering and computed nutrient totals ────────────────
console.log('\nTest 2: Multi-item rendering & computed nutrient totals');
{
  const items = [
    {
      id: 'egg-hopper',
      name: 'Egg Hopper',
      qty: 2,
      kcalPerServing: 160,
      proteinPerServing: 8,
      carbsPerServing: 18,
      fatPerServing: 6,
      emoji: '🥞',
    },
    {
      id: 'dhal',
      name: 'Dhal Curry',
      qty: 1,
      kcalPerServing: 180,
      proteinPerServing: 9,
      carbsPerServing: 25,
      fatPerServing: 5,
      emoji: '🍛',
    },
  ];

  const html = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      selectedMeal: 'breakfast',
    })
  );

  // Computed totals:
  // Kcal: 160 * 2 + 180 * 1 = 500
  // Protein: 8 * 2 + 9 * 1 = 25
  // Carbs: 18 * 2 + 25 * 1 = 61
  // Fat: 6 * 2 + 5 * 1 = 17
  assert(html.includes('500'), 'Renders computed total calories (500 kcal)');
  assert(html.includes('>25<') || html.includes('25<span'), 'Renders computed total protein (25g)');
  assert(html.includes('>61<') || html.includes('61<span'), 'Renders computed total carbs (61g)');
  assert(html.includes('>17<') || html.includes('17<span'), 'Renders computed total fat (17g)');
  assert(html.includes('Egg Hopper'), 'Renders food item 1: Egg Hopper');
  assert(html.includes('Dhal Curry'), 'Renders food item 2: Dhal Curry');
  assert(html.includes('🥞'), 'Renders food item 1 emoji: 🥞');
  assert(html.includes('🍛'), 'Renders food item 2 emoji: 🍛');
  assert(html.includes('2 srvs'), 'Renders pluralized servings for qty 2');
  assert(html.includes('1 srv'), 'Renders singular serving for qty 1');
}

// ── Test 3: Authoritative backend totals override ─────────────────────────────
console.log('\nTest 3: Authoritative backend totals override');
{
  const items = [
    { id: '1', name: 'Custom Combo', qty: 1, kcalPerServing: 100 },
  ];
  const authoritativeTotals = {
    caloriesKcal: 777,
    proteinG: 45,
    carbohydratesG: 80,
    fatG: 22,
  };

  const html = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      totals: authoritativeTotals,
    })
  );

  assert(html.includes('777'), 'Authoritative total calories (777 kcal) overrides calculated');
  assert(html.includes('>45<') || html.includes('45<span'), 'Authoritative total protein (45g) rendered');
  assert(html.includes('>80<') || html.includes('80<span'), 'Authoritative total carbs (80g) rendered');
  assert(html.includes('>22<') || html.includes('22<span'), 'Authoritative total fat (22g) rendered');
}

// ── Test 4: Verified vs. Estimate badge rendering ─────────────────────────────
console.log('\nTest 4: Food origin badges (Verified vs. AI Estimate)');
{
  const items = [
    { id: 'verified-1', name: 'Postgres DB Food', qty: 1, isVerified: true, emoji: '🥗' },
    { id: 'estimate-1', name: 'Gemini AI Estimate', qty: 1, isEstimate: true, emoji: '🍲' },
    { id: 'standard-1', name: 'Standard Food', qty: 1, emoji: '🍎' },
  ];

  const html = renderToStaticMarkup(React.createElement(MealPlateCard, { items }));

  assert(html.includes('title="Verified Food"'), 'Renders verified food badge with tooltip');
  assert(html.includes('>✓<'), 'Renders verified food checkmark indicator');
  assert(html.includes('title="AI Estimated Nutrition"'), 'Renders AI estimate badge with tooltip');
  assert(html.includes('>Est<'), 'Renders "Est" label for AI estimated food');
}

// ── Test 5: Read-only Preview mode vs. Editable mode ──────────────────────────
console.log('\nTest 5: Read-only Preview mode vs. Editable mode');
{
  const items = [{ id: '1', name: 'Egg Hopper', qty: 1, emoji: '🥞' }];

  // Preview Mode
  const previewHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      mode: 'preview',
      onIncreaseItem: () => {},
      onDecreaseItem: () => {},
      onSaveMeal: () => {},
    })
  );

  assert(!previewHtml.includes('aria-label="Decrease Egg Hopper"'), 'Preview mode suppresses decrease stepper');
  assert(!previewHtml.includes('aria-label="Increase Egg Hopper"'), 'Preview mode suppresses increase stepper');
  assert(previewHtml.includes('Confirm &amp; Log Meal') || previewHtml.includes('Confirm & Log Meal'), 'Preview mode defaults button text to "Confirm & Log Meal"');

  // Edit Mode
  const editHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      mode: 'edit',
      onIncreaseItem: () => {},
      onDecreaseItem: () => {},
      onSaveMeal: () => {},
    })
  );

  assert(editHtml.includes('aria-label="Decrease Egg Hopper"'), 'Edit mode renders decrease stepper with aria-label');
  assert(editHtml.includes('aria-label="Increase Egg Hopper"'), 'Edit mode renders increase stepper with aria-label');
  assert(editHtml.includes('Save 1 item'), 'Edit mode renders "Save 1 item" button text');
}

// ── Test 6: In-app Error State (Resolving CAL-001) ─────────────────────────────
console.log('\nTest 6: In-app error state banner (CAL-001)');
{
  const items = [{ id: '1', name: 'Rice', qty: 1 }];

  // Without error
  const noErrorHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, { items, error: null })
  );
  assert(!noErrorHtml.includes('role="alert"'), 'No error banner rendered when error is null');

  // With normal error message
  const errorMsg = 'Failed to persist meal log to backend. Connection timed out.';
  const withErrorHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, { items, error: errorMsg })
  );
  assert(withErrorHtml.includes('role="alert"'), 'Renders role="alert" banner when error is present');
  assert(withErrorHtml.includes(errorMsg), 'Displays the exact error message text');

  // With potential XSS script in error
  const maliciousError = '<script>alert("pwned")</script>Failed to save';
  const safeErrorHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, { items, error: maliciousError })
  );
  assert(!safeErrorHtml.includes('<script>'), 'Malicious script tags in error are escaped safely');
  assert(safeErrorHtml.includes('&lt;script&gt;'), 'Script tag correctly escaped as HTML entity');
}

// ── Test 7: Loading / Saving State ───────────────────────────────────────────
console.log('\nTest 7: Loading / Saving state');
{
  const items = [{ id: '1', name: 'Rice', qty: 1 }];

  const savingHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      isSaving: true,
      onSaveMeal: () => {},
    })
  );

  assert(savingHtml.includes('disabled=""') || savingHtml.includes('disabled'), 'Save button is disabled while saving');
  assert(savingHtml.includes('animate-spin'), 'Save button renders spinner while saving');
  assert(savingHtml.includes('Saving...'), 'Save button displays "Saving..." text');
}

// ── Test 8: Meal Slot Radio Selector ─────────────────────────────────────────
console.log('\nTest 8: Meal Slot Radio Selector');
{
  const items = [{ id: '1', name: 'Rice', qty: 1 }];

  const lunchHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      selectedMeal: 'lunch',
      onSelectMeal: () => {},
    })
  );

  assert(lunchHtml.includes('role="radiogroup"'), 'Renders radiogroup for meal slots');
  assert(lunchHtml.includes('aria-label="Select meal category"'), 'Radiogroup has accessible aria-label');
  assert(lunchHtml.includes('role="radio"'), 'Renders radio options');
  assert(lunchHtml.includes('aria-checked="true"'), 'Selected slot has aria-checked="true"');
  assert(lunchHtml.includes('aria-checked="false"'), 'Unselected slots have aria-checked="false"');
  assert(lunchHtml.includes('Breakfast') && lunchHtml.includes('Lunch') && lunchHtml.includes('Dinner') && lunchHtml.includes('Snack'), 'Renders all 4 standard meal slots');
}

// ── Test 9: Custom save label and extraAction slot ────────────────────────────
console.log('\nTest 9: Custom button label and extraAction slot');
{
  const items = [{ id: '1', name: 'Rice', qty: 1 }];
  const extraAction = React.createElement('button', { id: 'custom-action-btn' }, 'AI Assistant');

  const customHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, {
      items,
      saveButtonText: 'Add to Coach Log',
      extraAction,
      onSaveMeal: () => {},
    })
  );

  assert(customHtml.includes('Add to Coach Log'), 'Custom save button text rendered');
  assert(customHtml.includes('id="custom-action-btn"'), 'extraAction node rendered in action bar');
}

// ── Test 10: Fixed bottom vs. Inline layout ──────────────────────────────────
console.log('\nTest 10: Fixed bottom vs. Inline layout');
{
  const items = [{ id: '1', name: 'Rice', qty: 1 }];

  const fixedHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, { items, isFixedBottom: true })
  );
  assert(fixedHtml.includes('fixed bottom-[80px]'), 'Fixed layout wraps component in fixed bottom overlay');

  const inlineHtml = renderToStaticMarkup(
    React.createElement(MealPlateCard, { items, isFixedBottom: false })
  );
  assert(!inlineHtml.includes('fixed bottom-[80px]'), 'Inline layout renders without fixed overlay wrapper');
}

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

// Clean up ephemeral test directory
try {
  fs.rmSync(distTestDir, { recursive: true, force: true });
} catch (_) {}

if (failCount > 0) {
  process.exit(1);
}
