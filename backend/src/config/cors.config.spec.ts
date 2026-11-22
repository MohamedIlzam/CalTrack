import { getCorsOrigins } from './cors.config';

describe('CORS Configuration (Production Security Guard)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('in production mode (NODE_ENV=production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should throw fatal error if FRONTEND_URL is undefined', () => {
      delete process.env.FRONTEND_URL;
      expect(() => getCorsOrigins()).toThrow(
        /FRONTEND_URL environment variable is required in production/i,
      );
    });

    it('should throw fatal error if FRONTEND_URL is empty string or only whitespace', () => {
      process.env.FRONTEND_URL = '   ';
      expect(() => getCorsOrigins()).toThrow(
        /FRONTEND_URL environment variable is required in production/i,
      );
    });

    it('should throw fatal error if FRONTEND_URL contains wildcard (*)', () => {
      process.env.FRONTEND_URL = '*';
      expect(() => getCorsOrigins()).toThrow(
        /Wildcard origin \(\*\) is not permitted in production/i,
      );
    });

    it('should parse single valid origin', () => {
      process.env.FRONTEND_URL = 'https://caltrack.vercel.app';
      expect(getCorsOrigins()).toEqual(['https://caltrack.vercel.app']);
    });

    it('should parse multiple comma-separated valid origins and trim whitespace', () => {
      process.env.FRONTEND_URL =
        'https://caltrack.vercel.app, https://caltrack-preview.vercel.app ';
      expect(getCorsOrigins()).toEqual([
        'https://caltrack.vercel.app',
        'https://caltrack-preview.vercel.app',
      ]);
    });

    it('rejects non-HTTPS origins and values containing paths', () => {
      process.env.FRONTEND_URL = 'http://caltrack.example.com';
      expect(() => getCorsOrigins()).toThrow(/exact HTTPS origins/i);
      process.env.FRONTEND_URL = 'https://caltrack.example.com/app';
      expect(() => getCorsOrigins()).toThrow(/exact HTTPS origins/i);
    });
  });

  describe('in development / test mode (NODE_ENV != production)', () => {
    it('should return true (reflect origin) when FRONTEND_URL is unset', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.FRONTEND_URL;
      expect(getCorsOrigins()).toBe(true);
    });

    it('should return parsed origins when FRONTEND_URL is configured in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.FRONTEND_URL =
        'http://localhost:3000, http://192.168.1.50:3000';
      expect(getCorsOrigins()).toEqual([
        'http://localhost:3000',
        'http://192.168.1.50:3000',
      ]);
    });
  });
});
