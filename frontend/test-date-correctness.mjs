import { getLocalDateString, formatDisplayDate } from './src/lib/date.ts';

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
console.log('CALTRACK PHASE 01: DATE CORRECTNESS & TIMEZONE BOUNDARY TESTS');
console.log('================================================================\n');

// ── Test 1: Sri Lankan Midnight Boundary (+05:30) ─────────────────────────────
console.log('Test 1: Sri Lankan midnight boundary (1 second past midnight)');
{
  // 18:30:01 UTC = 00:00:01 on Nov 19 in Colombo (+05:30)
  const utcDate = new Date('2026-11-18T18:30:01.000Z');
  const result = getLocalDateString(utcDate, 'Asia/Colombo');
  const faultyIso = utcDate.toISOString().split('T')[0];

  assert(result === '2026-11-19', 'Evaluates to 2026-11-19 in Asia/Colombo');
  assert(faultyIso === '2026-11-18', 'Demonstrates that naive toISOString() yields incorrect prior day (2026-11-18)');
}

// ── Test 2: Sri Lankan Just Before Midnight ───────────────────────────────────
console.log('\nTest 2: Sri Lankan boundary (1 second before midnight)');
{
  // 18:29:59 UTC = 23:59:59 on Nov 18 in Colombo (+05:30)
  const utcDate = new Date('2026-11-18T18:29:59.000Z');
  const result = getLocalDateString(utcDate, 'Asia/Colombo');

  assert(result === '2026-11-18', 'Evaluates to 2026-11-18 in Asia/Colombo');
}

// ── Test 3: Early Morning Before 00:00 UTC (5:29 AM Colombo time) ────────────
console.log('\nTest 3: Early morning boundary before UTC rolls over (5:29 AM Colombo)');
{
  // 23:59:59 UTC on Nov 18 = 05:29:59 on Nov 19 in Colombo
  const utcDate = new Date('2026-11-18T23:59:59.000Z');
  const result = getLocalDateString(utcDate, 'Asia/Colombo');
  const faultyIso = utcDate.toISOString().split('T')[0];

  assert(result === '2026-11-19', 'Correctly identifies Nov 19 breakfast hours despite UTC still on Nov 18');
  assert(faultyIso === '2026-11-18', 'Confirms naive toISOString() would misclassify early breakfast onto yesterday');
}

// ── Test 4: Leap Year Boundary ────────────────────────────────────────────────
console.log('\nTest 4: Leap year calendar date boundary');
{
  // Feb 29, 2024 at 23:30 Colombo time = 18:00 UTC Feb 29
  const leapDate = new Date('2024-02-29T18:00:00.000Z');
  const result = getLocalDateString(leapDate, 'Asia/Colombo');

  assert(result === '2024-02-29', 'Preserves leap day Feb 29 correctly');
}

// ── Test 5: Default Environment Format ───────────────────────────────────────
console.log('\nTest 5: Default host timezone formatting');
{
  const now = new Date();
  const result = getLocalDateString(now);

  assert(/^\d{4}-\d{2}-\d{2}$/.test(result), `Produces valid YYYY-MM-DD pattern: "${result}"`);
}

// ── Test 6: formatDisplayDate ────────────────────────────────────────────────
console.log('\nTest 6: Display date formatting');
{
  const targetDate = new Date('2026-11-19T06:00:00.000Z');
  const displayStr = formatDisplayDate(targetDate, 'Asia/Colombo');

  assert(displayStr.includes('November 19'), `Display date includes "November 19": "${displayStr}"`);
}

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
