import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Re-import or replicate renderSafeInline from frontend/src/app/ai/page.tsx
 */
function renderSafeInline(str) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return React.createElement(
        'strong',
        { key: i, className: 'font-bold text-[#006B5F]' },
        boldText,
      );
    }
    return React.createElement(React.Fragment, { key: i }, part);
  });
}

function FormattedText({ text }) {
  const lines = text.split('\n');
  return React.createElement(
    'div',
    { className: 'space-y-2' },
    lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return React.createElement('div', { key: idx });

      // Bullet point
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bulletContent = trimmed.replace(/^(\*|-|•)\s+/, '');
        return React.createElement(
          'div',
          { key: idx, className: 'flex' },
          React.createElement('span', { className: 'bullet' }),
          React.createElement('span', null, renderSafeInline(bulletContent)),
        );
      }

      // Numbered list
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return React.createElement(
          'div',
          { key: idx, className: 'flex' },
          React.createElement('span', null, numMatch[1]),
          React.createElement('span', null, renderSafeInline(numMatch[2])),
        );
      }

      return React.createElement('p', { key: idx }, renderSafeInline(trimmed));
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION TEST SUITE: HTML / SCRIPT INJECTION SAFETY
// ─────────────────────────────────────────────────────────────────────────────
console.log('🧪 Running Safe Message Rendering Regression Tests...\n');

const testCases = [
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

let failed = 0;

for (const tc of testCases) {
  const rendered = renderToStaticMarkup(React.createElement(FormattedText, { text: tc.input }));

  // Check 1: Forbidden unescaped HTML tag must NOT appear in output
  if (rendered.includes(tc.forbidden)) {
    console.error(`❌ FAIL: [${tc.name}] - Unescaped tag found in rendered HTML!`);
    console.error(`   Output: ${rendered}`);
    failed++;
    continue;
  }

  // Check 2: Escaped entity must be present
  if (!rendered.includes(tc.expectedEscaped)) {
    console.error(`❌ FAIL: [${tc.name}] - Expected escaped entity not found!`);
    console.error(`   Expected to contain: ${tc.expectedEscaped}`);
    console.error(`   Output: ${rendered}`);
    failed++;
    continue;
  }

  // Check 3: If bold formatting was expected, ensure safe strong tag rendered
  if (tc.expectedContainsBold && !rendered.includes(tc.expectedContainsBold)) {
    console.error(`❌ FAIL: [${tc.name}] - Safe bold tag not rendered!`);
    failed++;
    continue;
  }

  console.log(`✅ PASS: [${tc.name}] properly escaped -> ${tc.expectedEscaped}`);
}

if (failed > 0) {
  console.error(`\n💥 ${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${testCases.length} XSS / Safe Rendering Regression Tests Passed!`);
}
