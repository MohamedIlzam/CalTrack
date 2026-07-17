import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  onModuleDestroy() {
    this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }
}
