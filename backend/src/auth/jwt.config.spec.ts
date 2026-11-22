import { getJwtSecret, MIN_JWT_SECRET_LENGTH, DEV_JWT_SECRET_FALLBACK } from './jwt.config';

describe('JWT Secret Configuration (Production Security Guard)', () => {
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

    it('should throw fatal error if JWT_SECRET is undefined', () => {
      delete process.env.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET environment variable is missing or empty/i);
    });

    it('should throw fatal error if JWT_SECRET is empty string or only whitespace', () => {
      process.env.JWT_SECRET = '   ';
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET environment variable is missing or empty/i);
    });

    it('should throw fatal error if JWT_SECRET is less than 32 characters', () => {
      process.env.JWT_SECRET = 'short-secret-key-only-24';
      expect(() => getJwtSecret()).toThrow(
        new RegExp(`must be at least ${MIN_JWT_SECRET_LENGTH} characters long`, 'i'),
      );
    });

    it('should return secret when JWT_SECRET is at least 32 characters', () => {
      const validSecret = 'a-very-long-production-jwt-secret-with-plenty-of-entropy-12345';
      process.env.JWT_SECRET = validSecret;
      expect(getJwtSecret()).toBe(validSecret);
    });
  });

  describe('in development / test mode (NODE_ENV != production)', () => {
    it('should return configured JWT_SECRET if present even if shorter than 32 chars', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'dev-custom-secret';
      expect(getJwtSecret()).toBe('dev-custom-secret');
    });

    it('should fall back to DEV_JWT_SECRET_FALLBACK when JWT_SECRET is unset in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_SECRET;
      expect(getJwtSecret()).toBe(DEV_JWT_SECRET_FALLBACK);
    });

    it('should fall back to DEV_JWT_SECRET_FALLBACK when JWT_SECRET is unset in test', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.JWT_SECRET;
      expect(getJwtSecret()).toBe(DEV_JWT_SECRET_FALLBACK);
    });
  });
});
