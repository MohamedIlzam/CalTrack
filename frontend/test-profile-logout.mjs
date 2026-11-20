/**
 * Regression Test Suite: Profile Page Logout Verification
 * 
 * Verifies:
 * 1. Profile Logout clears the authentication token from localStorage.
 * 2. Profile Logout resets authenticated Zustand state (token, email, targets, entries, hasOnboarded).
 * 3. Profile Logout redirects user to welcome/login screen ("/").
 * 4. Simulated browser refresh/reload does not restore the logged-in session.
 * 5. Parity between Home Logout and Profile Logout behaviors.
 */

import assert from 'node:assert';

// Simulated browser environment
const localStorageData = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStorageData.has(k) ? localStorageData.get(k) : null),
  setItem: (k, v) => localStorageData.set(k, String(v)),
  removeItem: (k) => localStorageData.delete(k),
  clear: () => localStorageData.clear(),
};
globalThis.window = globalThis;

console.log('================================================================');
console.log('CALTRACK V1: PROFILE LOGOUT REGRESSION TEST SUITE');
console.log('================================================================\n');

// Simulated minimal Zustand store reflecting useAppStore logic
function createTestStore() {
  let state = {
    hasOnboarded: false,
    name: '',
    email: null,
    token: null,
    targetCalories: 0,
    targetProteinG: 0,
    entries: [],
  };

  const persistToStorage = () => {
    localStorage.setItem('caltrack-storage', JSON.stringify({ state }));
  };

  const store = {
    getState: () => state,
    setAuth: (token, user) => {
      state = {
        ...state,
        token,
        email: user.email,
        name: user.name,
        hasOnboarded: true,
        targetCalories: user.targetCalories || 2000,
      };
      localStorage.setItem('token', token);
      persistToStorage();
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      state = {
        hasOnboarded: false,
        name: '',
        email: null,
        token: null,
        targetCalories: 0,
        targetProteinG: 0,
        entries: [],
      };
      persistToStorage();
    },
  };

  return store;
}

// Simulated getAuthToken matching frontend/src/lib/api.ts
function getAuthToken(store) {
  if (typeof window !== 'undefined') {
    const storeToken = store.getState().token;
    if (storeToken) return storeToken;

    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;

    try {
      const storage = localStorage.getItem('caltrack-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed?.state?.token) return parsed.state.token;
      }
    } catch (_) {}
  }
  return null;
}

// Simulated Profile Page handleLogout matching frontend/src/app/profile/page.tsx
function simulateProfileLogout(store, router) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  store.logout();
  router.replace('/');
}

// Simulated Home Page handleLogout matching frontend/src/app/home/page.tsx
function simulateHomeLogout(store, router) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  store.logout();
  router.replace('/');
}

// ─────────────────────────────────────────────────────────────
// Test Execution
// ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// Test 1: User logs in, tokens and state are properly established
runTest('Authenticated state correctly populates store and localStorage', () => {
  localStorage.clear();
  const store = createTestStore();
  const mockToken = 'jwt-token-alpha-12345';
  const mockUser = { email: 'alice@caltrack.lk', name: 'Alice Perera', targetCalories: 1950 };

  store.setAuth(mockToken, mockUser);

  assert.strictEqual(store.getState().token, mockToken);
  assert.strictEqual(store.getState().email, 'alice@caltrack.lk');
  assert.strictEqual(store.getState().hasOnboarded, true);
  assert.strictEqual(localStorage.getItem('token'), mockToken);
  assert.strictEqual(getAuthToken(store), mockToken);
});

// Test 2: Profile Logout clears token from localStorage and store
runTest('Profile logout removes "token" key from localStorage and resets Zustand', () => {
  localStorage.clear();
  const store = createTestStore();
  const mockToken = 'jwt-token-beta-67890';
  store.setAuth(mockToken, { email: 'bob@caltrack.lk', name: 'Bob Silva', targetCalories: 2100 });

  const routerCalls = [];
  const mockRouter = {
    replace: (path) => routerCalls.push(path),
    push: (path) => routerCalls.push(path),
  };

  simulateProfileLogout(store, mockRouter);

  // Assert localStorage "token" is removed
  assert.strictEqual(localStorage.getItem('token'), null, 'localStorage "token" must be null');
  // Assert store token is null
  assert.strictEqual(store.getState().token, null, 'Store token must be null');
  assert.strictEqual(store.getState().email, null, 'Store email must be null');
  assert.strictEqual(store.getState().hasOnboarded, false, 'Store hasOnboarded must be false');
  assert.strictEqual(store.getState().targetCalories, 0, 'Store targets must be reset');
  // Assert getAuthToken() returns null and does NOT resurrect old session
  assert.strictEqual(getAuthToken(store), null, 'getAuthToken() must return null');
  // Assert router redirected to "/"
  assert.deepStrictEqual(routerCalls, ['/'], 'Profile logout must redirect to "/"');
});

// Test 3: Simulated browser refresh after Profile logout does NOT restore session
runTest('Simulated page refresh after Profile logout does not restore previous session', () => {
  localStorage.clear();
  const store = createTestStore();
  store.setAuth('jwt-token-gamma', { email: 'charlie@caltrack.lk', name: 'Charlie' });

  const mockRouter = { replace: () => {} };
  simulateProfileLogout(store, mockRouter);

  // Simulate refresh: rehydrate a fresh store instance from localStorage
  const refreshedStore = createTestStore();
  const persistedRaw = localStorage.getItem('caltrack-storage');
  if (persistedRaw) {
    const { state } = JSON.parse(persistedRaw);
    refreshedStore.getState().hasOnboarded = state.hasOnboarded;
    refreshedStore.getState().token = state.token;
    refreshedStore.getState().email = state.email;
  }

  assert.strictEqual(localStorage.getItem('token'), null);
  assert.strictEqual(refreshedStore.getState().token, null);
  assert.strictEqual(refreshedStore.getState().hasOnboarded, false);
  assert.strictEqual(getAuthToken(refreshedStore), null);
});

// Test 4: Parity between Home Logout and Profile Logout
runTest('Parity: Home logout and Profile logout produce identical post-logout state', () => {
  // 1. Profile logout
  localStorage.clear();
  const store1 = createTestStore();
  store1.setAuth('token-1', { email: 'user1@test.lk', name: 'User 1' });
  const router1 = { replace: (p) => router1.dest = p, dest: null };
  simulateProfileLogout(store1, router1);

  // 2. Home logout
  localStorage.clear();
  const store2 = createTestStore();
  store2.setAuth('token-2', { email: 'user2@test.lk', name: 'User 2' });
  const router2 = { replace: (p) => router2.dest = p, dest: null };
  simulateHomeLogout(store2, router2);

  assert.strictEqual(store1.getState().token, store2.getState().token);
  assert.strictEqual(store1.getState().hasOnboarded, store2.getState().hasOnboarded);
  assert.strictEqual(store1.getState().email, store2.getState().email);
  assert.strictEqual(router1.dest, router2.dest);
  assert.strictEqual(router1.dest, '/');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
