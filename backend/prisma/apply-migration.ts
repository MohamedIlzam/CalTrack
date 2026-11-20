import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public';
  const url = new URL(dbUrl);
  const pool = new Pool({
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port || '5433', 10),
    database: url.pathname.substring(1),
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Applying additive migration for NutritionKnowledge...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NutritionKnowledge" (
          "id" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "sourceTitle" TEXT NOT NULL,
          "sourceUrl" TEXT NOT NULL,
          "provenance" TEXT NOT NULL,
          "contentHash" TEXT NOT NULL,
          "embedding" vector(384) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "NutritionKnowledge_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "NutritionKnowledge_contentHash_key" ON "NutritionKnowledge"("contentHash");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NutritionKnowledge_topic_idx" ON "NutritionKnowledge"("topic");
    `);
    console.log('✓ Migration applied successfully!');

    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Tables in public schema now:');
    console.log(tables.map((t: any) => t.table_name));
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
