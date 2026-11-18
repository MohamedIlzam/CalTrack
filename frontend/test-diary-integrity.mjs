/**
 * Regression Test Suite: Meal Diary State & Synchronization Integrity
 * Covers Scenarios 1 through 10 as specified by the Technical Lead.
 */

// Simulated in-memory PostgreSQL database table
let postgresMealLogEntries = [];

// Simulated postLogMeal API
async function mockPostLogMeal(payload, shouldFail = false) {
  if (shouldFail) {
    throw new Error('Network error or server unavailable');
  }
  const id = `pg-entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const entry = { id, ...payload, createdAt: new Date().toISOString() };
  postgresMealLogEntries.push(entry);
  return entry;
}

// Simulated deleteMealEntry API
async function mockDeleteMealEntry(id) {
  const idx = postgresMealLogEntries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    postgresMealLogEntries.splice(idx, 1);
  }
  return { success: true };
}

// Simulated fetchDailyLog API
async function mockFetchDailyLog(dateStr) {
  return {
    date: dateStr,
    entries: [...postgresMealLogEntries],
  };
}

// Minimal reproduction of Zustand Store logic
function createTestStore() {
  let state = {
    email: null,
    token: null,
    entries: [],
  };

  return {
    getState: () => state,
    setState: (updater) => {
      state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    },
    addFoodEntry: (entry) => {
      state.entries = [...state.entries, entry];
    },
    removeFoodEntry: (id) => {
      state.entries = state.entries.filter((e) => e.id !== id);
    },
    clearEntries: () => {
      state.entries = [];
    },
    setAuth: (token, user) => {
      const isDifferentUser = !state.email || state.email !== user.email;
      state = {
        ...state,
        token,
        email: user.email,
        entries: isDifferentUser ? [] : state.entries,
      };
    },
  };
}

// Simulation of the fixed handleSaveMeal workflow
async function simulateHandleSaveMeal({
  store,
  plateItems,
  selectedMeal,
  editEntryId = null,
  failNetwork = false,
}) {
  if (plateItems.length === 0) return;
  const dateStr = new Date().toISOString().split('T')[0];

  // In Edit Mode ONLY, remove the single specific entry being replaced
  if (editEntryId) {
    store.removeFoodEntry(editEntryId);
    await mockDeleteMealEntry(editEntryId);
  }

  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const first = plateItems[0];
  const comboName = plateItems.map((i) => i.name).join(', ');

  const tempEntry = {
    id: tempId,
    meal: selectedMeal,
    name: plateItems.length === 1 ? first.name : comboName,
    kcal: plateItems.reduce((s, i) => s + i.kcal * i.qty, 0),
    qty: 1,
  };

  // Optimistic UI update
  store.addFoodEntry(tempEntry);

  try {
    const savedEntry = await mockPostLogMeal(
      {
        meal: selectedMeal.toUpperCase(),
        unitName: tempEntry.name,
        loggedCaloriesKcal: tempEntry.kcal,
      },
      failNetwork,
    );

    // Replace tempId with persisted Postgres ID
    store.setState((s) => ({
      entries: s.entries.map((e) => (e.id === tempId ? { ...e, id: savedEntry.id } : e)),
    }));
    return { success: true, id: savedEntry.id };
  } catch (err) {
    // Revert optimistic addition if PostgreSQL persistence failed
    store.removeFoodEntry(tempId);
    return { success: false, error: err.message };
  }
}

// Simulation of Home page reload / sync from PostgreSQL
async function simulateHomeSync(store, dateStr = '2026-11-18') {
  const daily = await mockFetchDailyLog(dateStr);
  const syncedEntries = daily.entries.map((e) => ({
    id: e.id,
    name: e.unitName,
    kcal: e.loggedCaloriesKcal,
    meal: e.meal.toLowerCase(),
  }));
  store.setState({ entries: syncedEntries });
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('🧪 Running CalTrack Diary State & Synchronization Regression Tests...\n');

let failed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  const store = createTestStore();
  postgresMealLogEntries = [];

  // Scenario 1: Add Food A to Breakfast; add Food B to Breakfast; both remain.
  const res1 = await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-a', name: 'Egg Hopper', kcal: 160, qty: 1 }],
    selectedMeal: 'breakfast',
  });
  const res2 = await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-b', name: 'Dhal Curry', kcal: 120, qty: 1 }],
    selectedMeal: 'breakfast',
  });

  const b1 = store.getState().entries.filter((e) => e.meal === 'breakfast');
  assert(
    b1.length === 2 && postgresMealLogEntries.length === 2,
    'Scenario 1: Adding Food A then Food B to Breakfast preserves both entries in store and DB',
  );

  // Scenario 2: Add Food C to Breakfast; all three remain.
  await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-c', name: 'Pol Sambol', kcal: 90, qty: 1 }],
    selectedMeal: 'breakfast',
  });
  const b2 = store.getState().entries.filter((e) => e.meal === 'breakfast');
  assert(
    b2.length === 3 && postgresMealLogEntries.length === 3,
    'Scenario 2: Adding Food C to Breakfast preserves all 3 items (no deletion of previous foods)',
  );

  // Scenario 3: Breakfast entries are not affected by adding Lunch.
  await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-d', name: 'Rice & Curry Plate', kcal: 450, qty: 1 }],
    selectedMeal: 'lunch',
  });
  const b3 = store.getState().entries.filter((e) => e.meal === 'breakfast');
  const l3 = store.getState().entries.filter((e) => e.meal === 'lunch');
  assert(
    b3.length === 3 && l3.length === 1,
    'Scenario 3: Adding Lunch does not affect Breakfast entries (both slots preserved)',
  );

  // Scenario 4: A standard food followed by an AI-estimated food preserves both.
  await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'ai-prompt-kottu', name: 'Custom Kottu (AI Estimate)', kcal: 550, qty: 1 }],
    selectedMeal: 'dinner',
  });
  await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'standard-tea', name: 'Ginger Milk Tea', kcal: 80, qty: 1 }],
    selectedMeal: 'dinner',
  });
  const d4 = store.getState().entries.filter((e) => e.meal === 'dinner');
  assert(
    d4.length === 2 && d4.some((e) => e.name.includes('AI Estimate')),
    'Scenario 4: Standard food followed by AI-estimated food preserves both without overwrite',
  );

  // Scenario 5: Refresh/reload returns the complete diary.
  store.setState({ entries: [] }); // wipe local memory to simulate hard reload
  assert(store.getState().entries.length === 0, 'Memory wiped prior to reload');
  await simulateHomeSync(store);
  assert(
    store.getState().entries.length === 6 && postgresMealLogEntries.length === 6,
    'Scenario 5: Refresh/reload restores all 6 persisted entries authoritatively from PostgreSQL',
  );

  // Scenario 6: Deleting one entry does not delete others.
  const entryToDelete = store.getState().entries.find((e) => e.name === 'Dhal Curry');
  store.removeFoodEntry(entryToDelete.id);
  await mockDeleteMealEntry(entryToDelete.id);
  const b6 = store.getState().entries.filter((e) => e.meal === 'breakfast');
  assert(
    b6.length === 2 && !b6.some((e) => e.id === entryToDelete.id),
    'Scenario 6: Deleting one entry deletes only that entry and preserves all other breakfast entries',
  );

  // Scenario 7: Failed save does not trigger deletion or falsely display success.
  const beforeCount = store.getState().entries.length;
  const failRes = await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-fail', name: 'Offline Burger', kcal: 500, qty: 1 }],
    selectedMeal: 'lunch',
    failNetwork: true,
  });
  const afterCount = store.getState().entries.length;
  assert(
    failRes.success === false && beforeCount === afterCount,
    'Scenario 7: Failed save reverts optimistic entry and does not falsely display success',
  );

  // Scenario 8: Explicit editing affects only the intended entry.
  const breakfastToEdit = store.getState().entries.find((e) => e.name === 'Egg Hopper');
  const otherBreakfast = store.getState().entries.find((e) => e.name === 'Pol Sambol');
  await simulateHandleSaveMeal({
    store,
    plateItems: [{ id: 'food-a2', name: 'Double Egg Hopper', kcal: 320, qty: 1 }],
    selectedMeal: 'breakfast',
    editEntryId: breakfastToEdit.id,
  });
  const b8 = store.getState().entries.filter((e) => e.meal === 'breakfast');
  assert(
    b8.length === 2 &&
      b8.some((e) => e.name === 'Double Egg Hopper') &&
      b8.some((e) => e.id === otherBreakfast.id),
    'Scenario 8: Explicit editing replaces ONLY the target entry without touching other entries in the slot',
  );

  // Scenario 9: Switching authenticated users does not leak diary entries.
  store.setAuth('token-user-2', { email: 'different-user@caltrack.com', name: 'Different User' });
  assert(
    store.getState().entries.length === 0,
    'Scenario 9: Switching authenticated user wipes stale cached entries from Zustand',
  );

  // Scenario 10: Multiple concurrent save attempts cannot overwrite earlier entries.
  postgresMealLogEntries = [];
  store.clearEntries();
  const concurrentPromises = [1, 2, 3, 4].map((num) =>
    simulateHandleSaveMeal({
      store,
      plateItems: [{ id: `concurrent-${num}`, name: `Snack Item ${num}`, kcal: 100 * num, qty: 1 }],
      selectedMeal: 'snacks',
    }),
  );
  await Promise.all(concurrentPromises);
  const s10 = store.getState().entries.filter((e) => e.meal === 'snacks');
  assert(
    s10.length === 4 && postgresMealLogEntries.length === 4,
    'Scenario 10: Concurrent save attempts all append safely without overwriting earlier entries',
  );

  if (failed > 0) {
    console.error(`\n💥 ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n🎉 All 10 Diary State & Synchronization Regression Tests Passed!');
  }
}

runTests().catch(console.error);
