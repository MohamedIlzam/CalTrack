import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!dbUrl || !dbUrl.trim()) {
      throw new Error(
        'FATAL: DATABASE_URL environment variable is missing or empty in production mode. Refusing to connect to database.',
      );
    }
    let parsed: URL;
    try {
      parsed = new URL(dbUrl);
    } catch {
      throw new Error('FATAL: DATABASE_URL is not a valid PostgreSQL URL.');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error('FATAL: DATABASE_URL must use the PostgreSQL protocol.');
    }
    if (
      !['require', 'verify-full'].includes(
        parsed.searchParams.get('sslmode') || '',
      )
    ) {
      throw new Error(
        'FATAL: Production DATABASE_URL must require TLS using sslmode=require or sslmode=verify-full.',
      );
    }
    return dbUrl;
  }

  // Local development / test fallback
  return (
    dbUrl ||
    'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public'
  );
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client: PrismaClient;
  private readonly pool: Pool;

  constructor() {
    const dbUrl = getDatabaseUrl();
    this.pool = new Pool({
      connectionString: dbUrl,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });

    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });
  }

  // Proxy all Prisma model accessors through this service
  get user() {
    return this.client.user;
  }
  get region() {
    return this.client.region;
  }
  get brand() {
    return this.client.brand;
  }
  get food() {
    return this.client.food;
  }
  get foodAlias() {
    return this.client.foodAlias;
  }
  get unitConversion() {
    return this.client.unitConversion;
  }
  get foodEmbedding() {
    return this.client.foodEmbedding;
  }
  get mealLog() {
    return this.client.mealLog;
  }
  get mealLogEntry() {
    return this.client.mealLogEntry;
  }
  get weightEntry() {
    return this.client.weightEntry;
  }
  get nutritionKnowledge() {
    return (this.client as any).nutritionKnowledge;
  }

  // Expose raw query methods
  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client);
  }
  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
  }
}
