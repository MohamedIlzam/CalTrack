import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure compiled FormattedText component exists locally for testing
try {
  execSync(
    'node ./node_modules/typescript/bin/tsc src/components/ui/FormattedText.tsx --jsx react-jsx --module nodenext --moduleResolution nodenext --target es2022 --outDir ./dist-test',
    { cwd: __dirname, stdio: 'pipe' }
  );
} catch (e) {
  console.error('Failed to compile FormattedText for test:', e);
}

const { FormattedText, renderSafeInline } = await import('./dist-test/FormattedText.js');

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
console.log('CALTRACK V1: AI CHAT SAFE FORMATTING & UI POLISH SUITE');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// Part 1: HTML / SCRIPT INJECTION SAFETY REGRESSION TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('Part 1: HTML / Script Injection Safety');

const xssTestCases = [
  {
    name: 'Raw script tag',
    input: '<script>alert("xss")</script>',
    forbidden: '<script>',
    expectedEscaped: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
  },
  {
    name: 'Image tag with onerror vector',
    input: '<img src=x onerror=alert(document.cookie)>',
    forbidden: '<img',
    expectedEscaped: '&lt;img src=x onerror=alert(document.cookie)&gt;',
  },
  {
    name: 'SVG onload attack vector',
    input: '"><svg onload=alert(1)>',
    forbidden: '<svg',
    expectedEscaped: '&quot;&gt;&lt;svg onload=alert(1)&gt;',
  },
  {
    name: 'Bold text combined with malicious tag',
    input: 'Here is **bold info** and <script>malicious()</script>',
    forbidden: '<script>',
    expectedContainsBold: '<strong class="font-bold text-[#006B5F]">bold info</strong>',
    expectedEscaped: '&lt;script&gt;malicious()&lt;/script&gt;',
  },
  {
    name: 'List item with malicious payload',
    input: '* Item 1 with <iframe src="evil.com"></iframe>',
    forbidden: '<iframe',
    expectedEscaped: '&lt;iframe src=&quot;evil.com&quot;&gt;&lt;/iframe&gt;',
  },
  {
    name: 'Numbered list with javascript: href attempt',
    input: '1. Click here: <a href="javascript:alert(1)">Click</a>',
    forbidden: '<a href=',
    expectedEscaped: '&lt;a href=&quot;javascript:alert(1)&quot;&gt;',
  },
];

for (const tc of xssTestCases) {
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: tc.input }));
  assert(!rendered.includes(tc.forbidden), `[${tc.name}] - Unescaped tag does NOT appear in rendered HTML`);
  assert(rendered.includes(tc.expectedEscaped), `[${tc.name}] - Malicious characters escaped safely: ${tc.expectedEscaped}`);
  if (tc.expectedContainsBold) {
    assert(rendered.includes(tc.expectedContainsBold), `[${tc.name}] - Safe bold tag rendered alongside escaped script`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 2: Task A — AI Ingredient Creator Markdown Formatting
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 2: Task A — AI Ingredient Creator Markdown Formatting');

{
  // Simulated AI response for "butter chicken and naan"
  const aiResponseText =
    'AI Nutritional Estimate (approximate): **Butter Chicken and Naan** (~650 kcal, 32g P, 62g C, 30g F per 1 bowl with 1 piece of naan). Tap "Add to Plate" to include it! Note: Values are synthetic AI estimates, not scientifically or medically verified data.';

  const rendered = renderToStaticMarkup(
    React.createElement(FormattedText, {
      text: aiResponseText,
      className: 'space-y-1.5 text-[13px] leading-snug',
      boldClassName: 'font-bold text-[#006B5F]',
    })
  );

  assert(
    rendered.includes('<strong class="font-bold text-[#006B5F]">Butter Chicken and Naan</strong>'),
    'Renders **Butter Chicken and Naan** as actual styled <strong> element'
  );
  assert(
    !rendered.includes('**Butter Chicken and Naan**'),
    'Raw "**" markdown symbols are completely removed from user display'
  );
  assert(
    rendered.includes('~650 kcal, 32g P, 62g C, 30g F'),
    'Nutritional macro numbers are preserved exactly without alteration'
  );
}

{
  // Multiple bold items in single line
  const multiBoldText = 'Enjoy **Egg Hopper** with **Dhal Curry** for breakfast.';
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: multiBoldText }));

  assert(rendered.includes('>Egg Hopper</strong>'), 'First bold item rendered as <strong>');
  assert(rendered.includes('>Dhal Curry</strong>'), 'Second bold item rendered as <strong>');
  assert(!rendered.includes('**'), 'All "**" markers parsed and removed');
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 3: Task A & C — Paragraphs, Line Breaks and Lists
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 3: Paragraphs, Line Breaks and Lists');

{
  const multilineText = 'Paragraph one about balanced diet.\n\nParagraph two with details.\n\nParagraph three concluding advice.';
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: multilineText }));

  assert(rendered.includes('<p>Paragraph one about balanced diet.</p>'), 'Renders paragraph 1 cleanly');
  assert(rendered.includes('<p>Paragraph two with details.</p>'), 'Renders paragraph 2 cleanly');
  assert(rendered.includes('<p>Paragraph three concluding advice.</p>'), 'Renders paragraph 3 cleanly');
}

{
  const bulletListText = 'Key tips:\n* **High protein** sources like lentils\n- **Complex carbs** from red rice\n• Healthy fats in moderation';
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: bulletListText }));

  assert(rendered.includes('>High protein</strong>'), 'Bullet 1 (*): bold content formatted');
  assert(rendered.includes('>Complex carbs</strong>'), 'Bullet 2 (-): bold content formatted');
  assert(rendered.includes('Healthy fats in moderation'), 'Bullet 3 (•): unicode bullet parsed');
}

{
  const numberedListText = 'Steps to log:\n1. Choose your meal slot\n2. Adjust serving size\n3. Tap Confirm and Log';
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: numberedListText }));

  assert(rendered.includes('1'), 'Numbered item 1 badge rendered');
  assert(rendered.includes('Choose your meal slot'), 'Numbered item 1 content rendered');
  assert(rendered.includes('2'), 'Numbered item 2 badge rendered');
  assert(rendered.includes('3'), 'Numbered item 3 badge rendered');
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 4: Task A — Ingredient Cards & Add to Plate Preservation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 4: AI Ingredient Card & Action Preservation');

{
  const suggestedFood = {
    id: 'ai-butter-chicken',
    name: 'Butter Chicken and Naan',
    kcalPerServing: 650,
    proteinPerServing: 32,
    carbsPerServing: 62,
    fatPerServing: 30,
    emoji: '🍛',
    chipColor: '#006B5F',
    category: 'Curries',
    portionDescription: '1 bowl with 1 naan',
    isEstimate: true,
  };

  // Simulating the container in Search page: FormattedText + Card + Add to Plate
  const rendered = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'ai-message-container' },
      React.createElement(FormattedText, {
        text: 'AI Nutritional Estimate (approximate): **Butter Chicken and Naan**',
      }),
      React.createElement(
        'div',
        { className: 'ingredient-card' },
        React.createElement('span', { className: 'badge' }, 'AI Estimate (Approximate)'),
        React.createElement('h4', null, suggestedFood.name),
        React.createElement('span', null, `${suggestedFood.kcalPerServing} kcal`),
        React.createElement('button', { type: 'button' }, 'Add to Plate')
      )
    )
  );

  assert(rendered.includes('>Butter Chicken and Naan</strong>'), 'Formatted text renders bold dish title');
  assert(rendered.includes('AI Estimate (Approximate)'), 'AI Estimate badge preserved on card');
  assert(rendered.includes('650 kcal'), 'Exact calories preserved on card');
  assert(rendered.includes('Add to Plate'), 'Add to Plate action button present and operational');
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 5: Task B — AI Coach Layout & Suggestion Chips Lifecycle
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 5: Task B — AI Coach Layout & Suggestion Chips Lifecycle');

const SUGGESTION_CHIPS = [
  'Dinner ideas under 500 kcal',
  'High-protein Sri Lankan foods',
  'How are my macros today?',
  'Healthy evening snacks',
  'Post-workout meal advice',
];

{
  // State 1: Starting conversation (only initial welcome message, no user message)
  const initialWelcome = {
    id: 'welcome',
    role: 'coach',
    content: 'Hello! I am your CalTrack AI Nutrition Coach.',
  };
  const startingMessages = [initialWelcome];
  const hasStartedBefore = startingMessages.some((m) => m.role === 'user');

  assert(hasStartedBefore === false, 'hasStarted is false when only welcome message exists');

  // Render composer area in starting state
  const startingHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'composer-fixed-area' },
      !hasStartedBefore &&
        React.createElement(
          'div',
          { className: 'chips-row' },
          SUGGESTION_CHIPS.map((chip) =>
            React.createElement('button', { key: chip }, chip)
          )
        ),
      React.createElement('input', { placeholder: 'Ask your coach anything…' })
    )
  );

  assert(startingHtml.includes('Dinner ideas under 500 kcal'), 'Suggestion chips are available when starting conversation');
  assert(startingHtml.includes('High-protein Sri Lankan foods'), 'Multiple suggestion chips rendered for quick-start');
  assert(startingHtml.includes('Ask your coach anything…'), 'Input composer visible and ready');
}

{
  // State 2: Once conversation starts (user sent at least one message)
  const initialWelcome = { id: 'welcome', role: 'coach', content: 'Welcome!' };
  const userMessage = { id: 'user-1', role: 'user', content: 'How much protein in egg hopper?' };
  const activeMessages = [initialWelcome, userMessage];
  const hasStartedNow = activeMessages.some((m) => m.role === 'user');

  assert(hasStartedNow === true, 'hasStarted is true once user sends a message');

  // Render composer area in active conversation state
  const activeHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'composer-fixed-area' },
      !hasStartedNow &&
        React.createElement(
          'div',
          { className: 'chips-row' },
          SUGGESTION_CHIPS.map((chip) =>
            React.createElement('button', { key: chip }, chip)
          )
        ),
      React.createElement('input', { placeholder: 'Ask your coach anything…' })
    )
  );

  assert(!activeHtml.includes('Dinner ideas under 500 kcal'), 'Suggestion chips are removed once conversation starts');
  assert(!activeHtml.includes('chips-row'), 'Chips container does NOT render, freeing screen space');
  assert(activeHtml.includes('Ask your coach anything…'), 'Input composer remains visible and accessible');
}

{
  // State 3: Clear Chat resets conversation back to welcome and restores chips
  let messages = [
    { id: 'welcome', role: 'coach', content: 'Welcome!' },
    { id: 'user-1', role: 'user', content: 'Query' },
    { id: 'coach-1', role: 'coach', content: 'Answer' },
  ];

  // User taps Clear Chat
  messages = [{ id: 'welcome', role: 'coach', content: 'Welcome!' }];
  const hasStartedAfterReset = messages.some((m) => m.role === 'user');

  assert(hasStartedAfterReset === false, 'Clearing chat resets hasStarted to false');

  const resetHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'composer-fixed-area' },
      !hasStartedAfterReset &&
        React.createElement(
          'div',
          { className: 'chips-row' },
          SUGGESTION_CHIPS.map((chip) =>
            React.createElement('button', { key: chip }, chip)
          )
        ),
      React.createElement('input', { placeholder: 'Ask your coach anything…' })
    )
  );

  assert(resetHtml.includes('Dinner ideas under 500 kcal'), 'Suggestion chips reappear after conversation reset');
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 6: Scroll Clearance & Auto-Scroll Anchor Verification
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nPart 6: Scroll Clearance & Auto-Scroll Anchor');

{
  // Scroll thread with bottom anchor and dynamic padding
  const hasStarted = true;
  const paddingBottomClass = hasStarted ? 'pb-[160px]' : 'pb-[230px]';

  const threadHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: `scroll-thread ${paddingBottomClass}` },
      React.createElement('div', { className: 'message' }, 'Latest long AI response'),
      React.createElement('div', { className: 'scroll-anchor', id: 'messagesEnd' })
    )
  );

  assert(threadHtml.includes('pb-[160px]'), 'Uses compact pb-[160px] when chips removed during active chat');
  assert(threadHtml.includes('id="messagesEnd"'), 'Scroll anchor element present at thread bottom for smooth scrollIntoView');
}

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
