/**
 * CalTrack Date Utilities — Authoritative Local Calendar Date Management
 * 
 * Ensures consistent date-only representation (YYYY-MM-DD) across Search, Home,
 * and diary operations, eliminating UTC shift and midnight boundary bugs.
 */

/**
 * Returns the calendar date string in YYYY-MM-DD format for a given Date
 * in the user's local timezone (or an explicitly provided timezone e.g. 'Asia/Colombo').
 *
 * Avoids `toISOString().split('T')[0]` which evaluates in UTC and causes
 * day-boundary shifts for timezones ahead of UTC (e.g. Sri Lanka UTC+05:30).
 */
export function getLocalDateString(
  date: Date = new Date(),
  timeZone?: string
): string {
  // 'en-CA' produces standard ISO 8601 YYYY-MM-DD output
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Returns user-friendly formatted date for headers, e.g. "Tuesday, November 19, 2026"
 */
export function formatDisplayDate(
  date: Date = new Date(),
  timeZone?: string
): string {
  return date.toLocaleDateString('en-US', {
    timeZone: timeZone || undefined,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
