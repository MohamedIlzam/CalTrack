/**
 * CalTrack Intelligence Engine (CIE) — Standalone Nutrition RAG Ingestion Script
 *
 * Usage:
 *   npx ts-node -r dotenv/config prisma/seed-nutrition-rag.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { NutritionRagService } from '../src/ai/intelligence/rag/nutrition-rag.service';
import { CURATED_NUTRITION_KNOWLEDGE } from '../src/ai/intelligence/rag/nutrition-knowledge-data';

async function main() {
  console.log('================================================================');
  console.log('CALTRACK CIE: NUTRITION RAG KNOWLEDGE INGESTION');
  console.log('================================================================\n');

  const dbUrl =
    process.env.DATABASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public');

  if (!dbUrl) {
    throw new Error('FATAL: DATABASE_URL environment variable is required in production mode.');
  }

  const url = new URL(dbUrl);

  const pool = new Pool({
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port || '5433', 10),
    database: url.pathname.substring(1),
  });

  const adapter = new PrismaPg(pool);
  const prismaClient = new PrismaClient({ adapter });

  const mockPrismaService: any = {
    client: prismaClient,
    $queryRaw: prismaClient.$queryRaw.bind(prismaClient),
    $executeRaw: prismaClient.$executeRaw.bind(prismaClient),
  };

  const ragService = new NutritionRagService(mockPrismaService);
  await ragService.onModuleInit();

  console.log(`Starting ingestion of ${CURATED_NUTRITION_KNOWLEDGE.length} curated nutrition passages...`);
  const result = await ragService.ingestCuratedKnowledge(CURATED_NUTRITION_KNOWLEDGE);

  console.log('\n----------------------------------------------------------------');
  console.log('Ingestion Summary:');
  console.log(`  - Total Items Processed: ${result.totalProcessed}`);
  console.log(`  - Newly Inserted Chunks: ${result.inserted}`);
  console.log(`  - Skipped Duplicates:    ${result.skippedDuplicates}`);
  console.log('----------------------------------------------------------------\n');

  // Perform sample verification queries
  console.log('Verifying searchNutritionKnowledge retrieval:');

  const testQueries = [
    'How much protein do I need for muscle growth?',
    'What is a safe calorie deficit for weight loss?',
    'How much water should I drink per day?',
  ];

  for (const q of testQueries) {
    console.log(`\nQuery: "${q}"`);
    const hits = await ragService.searchNutritionKnowledge(q, 1);
    if (hits.length > 0) {
      console.log(`  ✓ Match: [${hits[0].topic}] "${hits[0].title}"`);
      console.log(`    Similarity: ${(hits[0].similarity * 100).toFixed(1)}% (Distance: ${hits[0].distance})`);
      console.log(`    Source: ${hits[0].sourceTitle}`);
    } else {
      console.log('  ✕ No matches found (distance above threshold)');
    }
  }

  await prismaClient.$disconnect();
  await pool.end();
  console.log('\n================================================================');
  console.log('✓ Nutrition RAG seeding & verification completed successfully.');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
