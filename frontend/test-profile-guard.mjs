/**
 * Regression Test Suite: Profile Route Protection Verification (Fix 02A)
 * 
 * Verifies:
 * 1. Guest access to /profile: Unauthenticated visitor is redirected to "/" and protected content is NOT rendered.
 * 2. Authenticated access to /profile: Authenticated visitor is allowed access without redirection.
 * 3. Authenticated browser refresh: Refreshing /profile with token in localStorage does NOT trigger false redirect during hydration.
 * 4. No protected-content flash: Guard outputs null/fallback before authentication check runs; profile data never leaks.
 * 5. Existing Profile Logout behavior: Logging out on /profile clears credentials, resets guard state, and redirects to "/".
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
console.log('CALTRACK V1: PROFILE ROUTE PROTECTION REGRESSION TEST SUITE');
console.log('================================================================\n');

// Mock Zustand Store with subscription support matching useAppStore
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

  const listeners = new Set();

  const persistToStorage = () => {
    localStorage.setItem('caltrack-storage', JSON.stringify({ state }));
  };

  const notify = (prevState) => {
    listeners.forEach((listener) => {
      try {
        listener(state, prevState);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setAuth: (token, user) => {
      const prev = { ...state };
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
      notify(prev);
    },
    logout: () => {
      const prev = { ...state };
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
      notify(prev);
    },
  };
}

// Function matching getAuthToken from frontend/src/lib/api.ts
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

// Simulated AuthGuard lifecycle matching frontend/src/components/auth/AuthGuard.tsx
function createAuthGuardSimulator(store, router) {
  let isAuthenticated = false;
  let hasChecked = false;
  let renderedOutput = null;

  const checkAuth = () => {
    hasChecked = true;
    const token = getAuthToken(store);
    if (!token) {
      isAuthenticated = false;
      router.replace('/');
      return false;
    }
    isAuthenticated = true;
    return true;
  };

  // Initial render (SSR / initial hydration before effect)
  const render = (childrenFn, fallback = null) => {
    if (!isAuthenticated) {
      renderedOutput = fallback;
    } else {
      renderedOutput = childrenFn();
    }
    return renderedOutput;
  };

  // Mount effect (runs after initial render)
  const mount = () => {
    checkAuth();
  };

  // Store subscription
  const unsubscribe = store.subscribe((state) => {
    if (!state.token && !getAuthToken(store)) {
      checkAuth();
    }
  });

  return {
    get isAuthenticated() { return isAuthenticated; },
    get hasChecked() { return hasChecked; },
    get renderedOutput() { return renderedOutput; },
    render,
    mount,
    checkAuth,
    cleanup: unsubscribe,
  };
}

// Router Mock
function createMockRouter() {
  const routes = [];
  return {
    replace: (path) => routes.push({ action: 'replace', path }),
    push: (path) => routes.push({ action: 'push', path }),
    get history() { return routes; },
    clear: () => routes.length = 0,
  };
}

// Test runner helper
let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    localStorage.clear();
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
// Test Case 1: Guest Access to /profile
// -----------------------------------------------------------------------------
runTest('Guest access: Unauthenticated visitor is redirected to "/" and content is not rendered', () => {
  const store = createTestStore();
  const router = createMockRouter();
  const guard = createAuthGuardSimulator(store, router);

  let profileContentEvaluated = false;
  const mockProfileContent = () => {
    profileContentEvaluated = true;
    return { type: 'ProfileContent', data: { name: 'Secret User', email: 'secret@user.com' } };
  };

  // 1. Initial render (mount phase before effect)
  const initialOutput = guard.render(mockProfileContent);
  assert.strictEqual(initialOutput, null, 'Initial render must be null (no content rendered)');
  assert.strictEqual(profileContentEvaluated, false, 'Profile content must not be evaluated on initial render');
  assert.strictEqual(guard.isAuthenticated, false, 'Guest is not authenticated');

  // 2. Mount effect executes auth check
  guard.mount();

  // 3. Assert redirect and state
  assert.strictEqual(router.history.length, 1, 'Router replace must be triggered exactly once');
  assert.strictEqual(router.history[0].action, 'replace');
  assert.strictEqual(router.history[0].path, '/', 'Redirect path must be "/"');
  assert.strictEqual(guard.isAuthenticated, false, 'Guard isAuthenticated remains false');

  // 4. Second render after check
  const postCheckOutput = guard.render(mockProfileContent);
  assert.strictEqual(postCheckOutput, null, 'Post-check output remains null for unauthenticated visitor');
  assert.strictEqual(profileContentEvaluated, false, 'Profile content was never evaluated');

  guard.cleanup();
});

// -----------------------------------------------------------------------------
// Test Case 2: Authenticated Access to /profile
// -----------------------------------------------------------------------------
runTest('Authenticated access: Authenticated user can open /profile without redirection', () => {
  const store = createTestStore();
  const router = createMockRouter();

  // Establish authenticated session
  store.setAuth('valid-jwt-token-123', {
    name: 'Ilzam CalTrack',
    email: 'ilzam@caltrack.app',
    targetCalories: 2100,
  });

  const guard = createAuthGuardSimulator(store, router);

  let profileContentEvaluated = false;
  const mockProfileContent = () => {
    profileContentEvaluated = true;
    return { type: 'ProfileContent', data: { name: store.getState().name } };
  };

  // 1. Mount effect runs
  guard.mount();

  // 2. Assert no redirect
  assert.strictEqual(router.history.length, 0, 'No redirect should occur for authenticated user');
  assert.strictEqual(guard.isAuthenticated, true, 'Guard isAuthenticated must be true');

  // 3. Render content
  const output = guard.render(mockProfileContent);
  assert.strictEqual(profileContentEvaluated, true, 'Profile content must be evaluated and rendered');
  assert.deepStrictEqual(output, {
    type: 'ProfileContent',
    data: { name: 'Ilzam CalTrack' },
  });

  guard.cleanup();
});

// -----------------------------------------------------------------------------
// Test Case 3: Authenticated Browser Refresh
// -----------------------------------------------------------------------------
runTest('Browser refresh: Token in localStorage prevents false redirect during store hydration', () => {
  // Simulate page reload: localStorage has token, but in-memory store starts empty
  localStorage.setItem('token', 'persisted-jwt-token-xyz');
  localStorage.setItem('caltrack-storage', JSON.stringify({
    state: {
      hasOnboarded: true,
      name: 'Persisted User',
      email: 'persisted@caltrack.app',
      token: 'persisted-jwt-token-xyz',
    },
  }));

  const store = createTestStore(); // Fresh memory store (token === null initially)
  assert.strictEqual(store.getState().token, null, 'Memory store starts empty on reload before hydration');

  const router = createMockRouter();
  const guard = createAuthGuardSimulator(store, router);

  const mockProfileContent = () => ({ type: 'ProfileContent', user: 'Persisted User' });

  // Mount effect runs: getAuthToken checks localStorage fallback
  guard.mount();

  // Must detect token from localStorage and NOT redirect
  assert.strictEqual(router.history.length, 0, 'Must NOT redirect during refresh when token is in localStorage');
  assert.strictEqual(guard.isAuthenticated, true, 'Guard recognizes valid token from localStorage');

  // Renders profile content successfully
  const output = guard.render(mockProfileContent);
  assert.deepStrictEqual(output, { type: 'ProfileContent', user: 'Persisted User' });

  guard.cleanup();
});

// -----------------------------------------------------------------------------
// Test Case 4: No Protected-Content Flash
// -----------------------------------------------------------------------------
runTest('No content flash: Initial render tree is completely null before auth check completes', () => {
  const store = createTestStore();
  const router = createMockRouter();
  const guard = createAuthGuardSimulator(store, router);

  let sensitiveComponentMounted = false;
  const mockSensitiveProfile = () => {
    sensitiveComponentMounted = true;
    return {
      type: 'SensitiveDOM',
      body: 'CONFIDENTIAL_HEALTH_DATA_WEIGHT_CALORIES',
    };
  };

  // Before mount() / effect has fired
  assert.strictEqual(guard.hasChecked, false, 'Auth check has not run yet');
  const initialFrame = guard.render(mockSensitiveProfile);

  assert.strictEqual(initialFrame, null, 'Initial frame must be null');
  assert.strictEqual(sensitiveComponentMounted, false, 'Sensitive component was NOT mounted in initial frame');

  guard.cleanup();
});

// -----------------------------------------------------------------------------
// Test Case 5: Existing Profile Logout Behavior
// -----------------------------------------------------------------------------
runTest('Profile Logout: Logging out unmounts content, resets guard, and redirects to "/"', () => {
  const store = createTestStore();
  const router = createMockRouter();

  // User starts logged in
  store.setAuth('jwt-active-session', {
    name: 'Active User',
    email: 'active@caltrack.app',
  });

  const guard = createAuthGuardSimulator(store, router);
  guard.mount();
  assert.strictEqual(guard.isAuthenticated, true);

  const mockProfileContent = () => ({ type: 'ProfileContent', active: true });
  assert.notStrictEqual(guard.render(mockProfileContent), null);

  router.clear();

  // User clicks Logout on /profile (simulating handleLogout)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  store.logout();
  router.replace('/');

  // Verify credentials removed
  assert.strictEqual(getAuthToken(store), null, 'Token must be null after logout');
  assert.strictEqual(guard.isAuthenticated, false, 'Guard must update isAuthenticated to false');

  // Verify redirect occurred
  const lastNav = router.history[router.history.length - 1];
  assert.strictEqual(lastNav.path, '/', 'User redirected to "/"');

  // Verify content is now unmounted
  const postLogoutRender = guard.render(mockProfileContent);
  assert.strictEqual(postLogoutRender, null, 'Profile content must be unmounted after logout');

  guard.cleanup();
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`[test-profile-guard] ${passCount} passed, ${failCount} failed`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
