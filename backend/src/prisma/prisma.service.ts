import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Password123%40%23%24@localhost:5432/caltrack?schema=public';
    const url = new URL(dbUrl);
    
    const pool = new Pool({
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      database: url.pathname.substring(1),
    });

    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter });
  }

  // Proxy all Prisma model accessors through this service
  get user() { return this.client.user; }
  get foodItem() { return this.client.foodItem; }
  get mealLog() { return this.client.mealLog; }
  get mealLogEntry() { return this.client.mealLogEntry; }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
