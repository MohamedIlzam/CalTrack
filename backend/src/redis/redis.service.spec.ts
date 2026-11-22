import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService - Fixed Window Rate Limiting', () => {
  let service: RedisService;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      eval: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      on: jest.fn(),
      quit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
    // Inject mock redis client
    (service as any).client = mockRedisClient;
  });

  it('should allow request when counter is within the limit (e.g. 1st request)', async () => {
    mockRedisClient.eval.mockResolvedValue(1);

    const result = await service.checkRateLimit('ratelimit:ai:user123', 15, 60);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(14);
    expect(result.current).toBe(1);
    expect(mockRedisClient.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('INCR', KEYS[1])"),
      1,
      'ratelimit:ai:user123',
      60,
    );
  });

  it('should allow request when counter reaches limit (e.g. 15th request)', async () => {
    mockRedisClient.eval.mockResolvedValue(15);

    const result = await service.checkRateLimit('ratelimit:ai:user123', 15, 60);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.current).toBe(15);
  });

  it('should reject request when counter exceeds limit (e.g. 16th request)', async () => {
    mockRedisClient.eval.mockResolvedValue(16);

    const result = await service.checkRateLimit('ratelimit:ai:user123', 15, 60);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.current).toBe(16);
  });

  it('should throw and fail closed when Redis connection drops or throws an error', async () => {
    mockRedisClient.eval.mockRejectedValue(new Error('Connection to Redis lost'));

    await expect(service.checkRateLimit('ratelimit:ai:user123', 15, 60)).rejects.toThrow(
      'Connection to Redis lost',
    );
  });
});
