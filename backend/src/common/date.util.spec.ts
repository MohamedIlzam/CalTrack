import {
  getLocalDateString,
  parseLocalDate,
  resolveDiaryDate,
  DEFAULT_TIMEZONE,
} from './date.util';

describe('Date Utilities — Sri Lankan UTC+05:30 Boundary & Consistency', () => {
  describe('getLocalDateString with Asia/Colombo', () => {
    it('should evaluate 18:30:01 UTC as the next calendar day in Sri Lanka (+05:30)', () => {
      // 18:30:01 UTC on Nov 18 is 00:00:01 on Nov 19 in Asia/Colombo
      const date = new Date('2026-11-18T18:30:01.000Z');
      const result = getLocalDateString(date, 'Asia/Colombo');
      expect(result).toBe('2026-11-19');
    });

    it('should evaluate 18:29:59 UTC as the prior calendar day in Sri Lanka (+05:30)', () => {
      // 18:29:59 UTC on Nov 18 is 23:59:59 on Nov 18 in Asia/Colombo
      const date = new Date('2026-11-18T18:29:59.000Z');
      const result = getLocalDateString(date, 'Asia/Colombo');
      expect(result).toBe('2026-11-18');
    });

    it('should evaluate early morning 05:29:59 Colombo time (23:59:59 UTC) as the same local day', () => {
      // 23:59:59 UTC on Nov 18 is 05:29:59 on Nov 19 in Colombo
      const date = new Date('2026-11-18T23:59:59.000Z');
      const result = getLocalDateString(date, 'Asia/Colombo');
      expect(result).toBe('2026-11-19');
    });

    it('should default to DEFAULT_TIMEZONE (Asia/Colombo) when timezone is omitted', () => {
      const date = new Date('2026-11-18T19:00:00.000Z');
      const result = getLocalDateString(date);
      expect(result).toBe('2026-11-19');
    });
  });

  describe('parseLocalDate', () => {
    it('should parse YYYY-MM-DD into normalized UTC midnight Date object', () => {
      const parsed = parseLocalDate('2026-11-19');
      expect(parsed.toISOString()).toBe('2026-11-19T00:00:00.000Z');
    });
  });

  describe('resolveDiaryDate', () => {
    it('should respect an explicit YYYY-MM-DD dateStr', () => {
      const { dateStr, utcMidnightDate } = resolveDiaryDate('2026-11-15');
      expect(dateStr).toBe('2026-11-15');
      expect(utcMidnightDate.toISOString()).toBe('2026-11-15T00:00:00.000Z');
    });

    it('should resolve timezone date when dateStr is omitted, preventing server UTC skew', () => {
      const { dateStr, utcMidnightDate } = resolveDiaryDate(undefined, 'Asia/Colombo');
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(utcMidnightDate.getUTCHours()).toBe(0);
      expect(utcMidnightDate.getUTCMinutes()).toBe(0);
      expect(utcMidnightDate.getUTCSeconds()).toBe(0);
    });
  });
});
