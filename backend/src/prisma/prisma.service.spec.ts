import { getDatabaseUrl } from './prisma.service';

describe('Prisma Database Configuration (Production Security Guard)', () => {
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

    it('should throw fatal error if DATABASE_URL is undefined', () => {
      delete process.env.DATABASE_URL;
      expect(() => getDatabaseUrl()).toThrow(/DATABASE_URL environment variable is missing or empty/i);
    });

    it('should throw fatal error if DATABASE_URL is empty string or whitespace', () => {
      process.env.DATABASE_URL = '   ';
      expect(() => getDatabaseUrl()).toThrow(/DATABASE_URL environment variable is missing or empty/i);
    });

    it('should return DATABASE_URL when properly configured in production', () => {
      const prodUrl = 'postgresql://caltrack_user:StrongSecret123!@ep-prod.neon.tech/caltrack?sslmode=require';
      process.env.DATABASE_URL = prodUrl;
      expect(getDatabaseUrl()).toBe(prodUrl);
    });
  });

  describe('in development / test mode (NODE_ENV != production)', () => {
    it('should fall back to local docker postgres URL if DATABASE_URL is unset', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DATABASE_URL;
      expect(getDatabaseUrl()).toBe(
        'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public',
      );
    });

    it('should return configured DATABASE_URL when set in development', () => {
      process.env.NODE_ENV = 'development';
      const devUrl = 'postgresql://custom:custom@localhost:5432/caltrack_dev';
      process.env.DATABASE_URL = devUrl;
      expect(getDatabaseUrl()).toBe(devUrl);
    });
  });
});
