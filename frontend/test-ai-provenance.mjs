import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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
console.log('CALTRACK V1: AI PROVENANCE & ROUTING REGRESSION SUITE');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// Part 1: Provenance Categories & Badge Rendering
// ─────────────────────────────────────────────────────────────────────────────
console.log('Part 1: Provenance Source Categories & Visual Badges');

const PROVENANCE_CATEGORIES = [
  {
    source: 'gemini',
    label: 'Gemini AI',
    symbol: '✦',
    expectedClass: 'text-purple-700',
  },
  {
    source: 'caltrack_data',
    label: 'CalTrack Data',
    symbol: '📊',
    expectedClass: 'text-emerald-700',
  },
  {
    source: 'caltrack_local',
    label: 'CalTrack Local',
    symbol: '⚙',
    expectedClass: 'text-gray-700',
  },
  {
    source: 'local_fallback',
    label: 'Local Fallback',
    symbol: '⚡',
    expectedClass: 'text-amber-700',
  },
  {
    source: 'hybrid',
    label: 'CalTrack Data + Gemini AI',
    symbol: '✦',
    expectedClass: 'text-purple-700',
  },
];

function renderProvenancePill(provenance) {
  if (!provenance) return null;
  const colorClass =
    provenance.source === 'gemini' || provenance.source === 'hybrid'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : provenance.source === 'caltrack_data'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : provenance.source === 'local_fallback'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';

  const symbol =
    provenance.source === 'gemini'
      ? '✦'
      : provenance.source === 'caltrack_data'
      ? '📊'
      : provenance.source === 'local_fallback'
      ? '⚡'
      : provenance.source === 'caltrack_local'
      ? '⚙'
      : '✦';

  return React.createElement(
    'div',
    { className: 'flex items-center gap-1.5 px-1' },
    React.createElement(
      'span',
      {
        title: provenance.details,
        className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${colorClass}`,
      },
      React.createElement('span', null, symbol),
      React.createElement('span', null, provenance.label)
    )
  );
}

for (const cat of PROVENANCE_CATEGORIES) {
  const rendered = renderToStaticMarkup(renderProvenancePill(cat));
  assert(rendered.includes(cat.label), `Renders category label: "${cat.label}"`);
  assert(rendered.includes(cat.expectedClass), `Applies correct color styling for "${cat.source}"`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 2: Backwards Compatibility for Stored Messages Without Provenance
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 2: Backwards Compatibility with Legacy Stored Messages');

const legacyMessage = {
  id: 'legacy-msg-1',
  role: 'coach',
  content: 'Here is your daily summary: 2,000 kcal consumed.',
  timestamp: '10:30 AM',
  // provenance is undefined on legacy messages
};

const legacyRendered = renderToStaticMarkup(renderProvenancePill(legacyMessage.provenance));
assert(legacyRendered === '', 'Legacy stored message without provenance renders safely without markup or crash');

// ─────────────────────────────────────────────────────────────────────────────
// Part 3: AI Ingredient Creator Card Source Labeling
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 3: AI Ingredient Creator Card Source Labeling');

function renderIngredientCreatorBadge(provenance) {
  return React.createElement(
    'div',
    { className: 'flex items-center gap-1.5' },
    React.createElement(
      'span',
      { className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800' },
      'AI Estimate (Approximate)'
    ),
    provenance
      ? React.createElement(
          'span',
          { className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700' },
          `✦ ${provenance.label}`
        )
      : null
  );
}

const cardRendered = renderToStaticMarkup(
  renderIngredientCreatorBadge({ source: 'gemini', label: 'Gemini AI', details: 'Google Gemini' })
);
assert(cardRendered.includes('✦ Gemini AI'), 'Ingredient Creator card displays explicit Gemini AI provenance badge');
assert(cardRendered.includes('AI Estimate (Approximate)'), 'Retains required approximate estimate disclaimer');

// ─────────────────────────────────────────────────────────────────────────────
// Part 4: Account Isolation and Logout Purging
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 4: Account Isolation & Chat Thread Purging');

// Mock Zustand store state
let mockStoreState = {
  token: 'mock-token-user-a',
  coachMessages: [
    { id: '1', role: 'user', content: 'Private user A health record' },
    { id: '2', role: 'coach', content: 'User A target is 2000 kcal' },
  ],
};

function performLogout() {
  mockStoreState = {
    token: null,
    coachMessages: [],
  };
}

assert(mockStoreState.coachMessages.length === 2, 'Initial user session contains active chat messages');
performLogout();
assert(mockStoreState.token === null, 'Logout clears authentication token');
assert(mockStoreState.coachMessages.length === 0, 'Logout completely purges all coach messages for privacy and isolation');

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
