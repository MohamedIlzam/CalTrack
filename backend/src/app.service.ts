import {
  Injectable,
  Logger,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly redis?: RedisService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    let dbStatus = 'not_configured';
    let redisStatus = 'not_configured';

    if (this.prisma) {
      try {
        await this.prisma.client.$queryRawUnsafe('SELECT 1');
        dbStatus = 'ok';
      } catch (err: any) {
        dbStatus = 'unreachable';
        this.logger.warn(`Health check DB error: ${err.message}`);
      }
    }

    if (this.redis) {
      try {
        await this.redis.get('health:ping');
        redisStatus = 'ok';
      } catch (err: any) {
        redisStatus = 'unreachable';
        this.logger.warn(`Health check Redis error: ${err.message}`);
      }
    }

    const isHealthy = dbStatus !== 'unreachable';

    const health = {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
    if (!isHealthy) {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }
}
