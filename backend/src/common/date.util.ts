/**
 * CalTrack Backend Date Utilities
 *
 * Ensures consistent date-only representation (YYYY-MM-DD) across all backend services
 * and controllers, eliminating server-local UTC skews and day-boundary shifts
 * for timezones ahead of UTC (such as Sri Lanka UTC+05:30).
 */

export const DEFAULT_TIMEZONE = 'Asia/Colombo';

/**
 * Returns date-only string in YYYY-MM-DD format for a given Date and timezone.
 * Defaults to 'Asia/Colombo' (+05:30) to prevent server UTC clock skew.
 */
export function getLocalDateString(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Converts a YYYY-MM-DD string to a normalized UTC midnight Date object,
 * matching PostgreSQL MealLog.date schema storage.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Resolves an authoritative calendar date for diary operations:
 * - If an explicit YYYY-MM-DD string is provided, validates and uses it.
 * - Otherwise, resolves using the target timezone (default: 'Asia/Colombo'),
 *   guaranteeing correct date calculation even when host server runs in UTC.
 */
export function resolveDiaryDate(
  dateStr?: string,
  timeZone: string = DEFAULT_TIMEZONE,
): { dateStr: string; utcMidnightDate: Date } {
  const resolvedDateStr =
    dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? dateStr
      : getLocalDateString(new Date(), timeZone);

  return {
    dateStr: resolvedDateStr,
    utcMidnightDate: parseLocalDate(resolvedDateStr),
  };
}
