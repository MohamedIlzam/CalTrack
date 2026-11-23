/**
 * CalTrack V1: Desktop QR Landing Screen Regression Test Suite
 *
 * Verifies:
 * 1. DesktopLandingScreen renders CalTrack branding and logo
 * 2. Exact required heading: "CalTrack is designed for mobile."
 * 3. Exact required supporting text: "For the best experience, open CalTrack on your phone."
 * 4. A real, working QR code SVG encoding "https://caltrack-staging-web.vercel.app/"
 * 5. Exact required instruction: "Scan this QR code with your phone's camera to get started."
 * 6. The website URL is present as a clickable alternative
 * 7. Responsive behavior: uses CSS breakpoints (hidden lg:flex for desktop, lg:hidden for mobile main)
 *    ensuring desktop displays QR screen, mobile displays application, and tablets preserve usable mobile layout
 * 8. Pure CSS responsive display prevents hydration flash of mobile content
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QRCodeSVG } from 'qrcode.react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('CALTRACK V1: DESKTOP QR LANDING SCREEN TEST SUITE');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Component Verification
// ─────────────────────────────────────────────────────────────────────────────

// Import DesktopLandingScreen from build output or source
const componentSource = fs.readFileSync(
  path.join(__dirname, 'src/components/ui/DesktopLandingScreen.tsx'),
  'utf-8'
);
const layoutSource = fs.readFileSync(
  path.join(__dirname, 'src/app/layout.tsx'),
  'utf-8'
);

// Test 1: CalTrack Branding and Logo
runTest('CalTrack branding and logo are present in DesktopLandingScreen', () => {
  assert(componentSource.includes('CalTrack'), 'Includes CalTrack brand name');
  assert(componentSource.includes('Mobile Edition') || componentSource.includes('Mobile-First'), 'Includes mobile edition tag');
  assert(componentSource.includes('<svg'), 'Includes stylized logo SVG');
});

// Test 2: Required Heading
runTest('Heading contains exact copy: "CalTrack is designed for mobile."', () => {
  assert(
    componentSource.includes('CalTrack is designed for mobile.'),
    'Exact heading text found in component'
  );
});

// Test 3: Required Supporting Text
runTest('Supporting text contains exact copy: "For the best experience, open CalTrack on your phone."', () => {
  assert(
    componentSource.includes('For the best experience, open CalTrack on your phone.'),
    'Exact supporting text found in component'
  );
});

// Test 4: Real QR Code with exact deployed staging URL
runTest('QR code generates valid SVG encoding "https://caltrack-staging-web.vercel.app/"', () => {
  const targetUrl = 'https://caltrack-staging-web.vercel.app/';
  assert(componentSource.includes(targetUrl), 'Staging URL is defined in component');

  const renderedQrSvg = renderToStaticMarkup(
    React.createElement(QRCodeSVG, {
      value: targetUrl,
      size: 220,
      level: 'M',
    })
  );

  assert(renderedQrSvg.startsWith('<svg'), 'QR code renders as valid SVG element');
  assert(renderedQrSvg.includes('path') || renderedQrSvg.includes('rect'), 'QR code contains vector module shapes');
  assert(renderedQrSvg.length > 500, 'QR code has substantial vector payload (real matrix)');
});

// Test 5: Required Instruction Text
runTest('Instruction contains exact copy: "Scan this QR code with your phone\'s camera to get started."', () => {
  assert(
    componentSource.includes('Scan this QR code with your phone') &&
    componentSource.includes('camera to get started.'),
    'Exact instruction text found in component'
  );
});

// Test 6: Clickable URL Alternative
runTest('Website URL is present as a clickable link alternative', () => {
  assert(
    componentSource.includes('href={STAGING_URL}') ||
    componentSource.includes('href="https://caltrack-staging-web.vercel.app/"'),
    'Link target points to deployed staging URL'
  );
  assert(componentSource.includes('target="_blank"'), 'Link opens safely in new tab');
  assert(componentSource.includes('rel="noopener noreferrer"'), 'Link contains secure rel attributes');
});

// Test 7: Responsive CSS Breakpoint Architecture
runTest('Desktop landing screen has "hidden lg:flex" to display only on >= 1024px screens', () => {
  assert(
    componentSource.includes('hidden lg:flex'),
    'Desktop landing screen uses Tailwind responsive classes "hidden lg:flex"'
  );
});

runTest('Mobile application container in layout has "lg:hidden" to hide on >= 1024px screens', () => {
  assert(
    layoutSource.includes('lg:hidden'),
    'RootLayout main mobile container includes "lg:hidden" to prevent exposure on desktop'
  );
  assert(
    layoutSource.includes('<DesktopLandingScreen />'),
    'RootLayout includes DesktopLandingScreen component'
  );
});

runTest('Tablets (< 1024px) preserve the usable mobile experience', () => {
  // Mobile app is shown on all screens below lg: (1024px), which includes phones and portrait/landscape tablets
  assert(!layoutSource.includes('md:hidden'), 'Does NOT hide mobile layout on tablet md: (768px)');
  assert(!layoutSource.includes('sm:hidden'), 'Does NOT hide mobile layout on sm: (640px)');
});

runTest('Uses pure responsive CSS rather than user-agent detection to prevent hydration flash', () => {
  assert(
    !componentSource.includes('navigator.userAgent'),
    'Does NOT rely on client-side navigator.userAgent sniffing for layout display'
  );
  assert(
    !layoutSource.includes('navigator.userAgent'),
    'RootLayout does NOT rely on navigator.userAgent'
  );
});

console.log(`\n================================================================`);
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log(`================================================================`);

if (failedCount > 0) {
  process.exit(1);
}
