import { getRedisUrl } from './redis.service';

describe('Redis production security configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'production' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('requires a configured TLS Redis URL in production', () => {
    delete process.env.REDIS_URL;
    expect(() => getRedisUrl()).toThrow(/required/i);
    process.env.REDIS_URL = 'redis://example.test:6379';
    expect(() => getRedisUrl()).toThrow(/must use TLS/i);
    process.env.REDIS_URL = 'rediss://default:secret@example.test:6379';
    expect(getRedisUrl()).toBe(process.env.REDIS_URL);
  });
});
