import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis client error: ${err.message}`);
    });
  }

  onModuleDestroy() {
    this.client?.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Fixed-Window Rate Limiter
   *
   * Executes an atomic Lua script in Redis to increment the counter and set the TTL
   * on the first request of the window. This ensures the counter and expiry are set
   * in a single atomic transaction, preventing keys from persisting indefinitely without TTL.
   *
   * Fails closed: If Redis is unreachable or returns an error, the exception is thrown
   * so callers can safely reject traffic (e.g. HTTP 503) rather than allowing unmetered access.
   *
   * @param key Redis key identifying the user and rate-limited endpoint
   * @param limit Maximum allowed requests within the fixed time window
   * @param windowSeconds Window duration in seconds
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; current: number }> {
    const luaScript = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return current
    `;

    const result = await this.client.eval(luaScript, 1, key, windowSeconds);
    const current =
      typeof result === 'number' ? result : parseInt(String(result), 10);

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      current,
    };
  }
}
