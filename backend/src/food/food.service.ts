import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class FoodService implements OnModuleInit {
  private generateEmbedding: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    console.log('Loading AI embedding model for semantic search...');
    // We use Xenova's transformers to run the NLP model locally in Node
    this.generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('AI model loaded!');
  }

  async searchFoods(query: string, limit: number = 20) {
    const cacheKey = `search:food:${query.toLowerCase().trim()}`;
    
    // 1. Check Redis Cache first (for sub-50ms responses on common queries)
    const cachedResult = await this.redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // 2. Generate vector embedding for the search query
    const output = await this.generateEmbedding(query, { pooling: 'mean', normalize: true });
    const embeddingArray = Array.from(output.data);
    const embeddingString = JSON.stringify(embeddingArray);

    // 3. Query PostgreSQL using pgvector's cosine distance (<=>)
    // We join the UnitConversions to return the serving sizes
    const foods = await this.prisma.$queryRaw`
      SELECT 
        f.id,
        f.name,
        f.category,
        f."caloriesKcal",
        f."proteinG",
        f."carbohydratesG",
        f."fatG",
        f."isVerified",
        (
          SELECT json_agg(json_build_object('unitName', uc."unitName", 'gramEquivalent', uc."gramEquivalent"))
          FROM "UnitConversion" uc WHERE uc."foodId" = f.id
        ) as "unitConversions",
        (fe.embedding <=> ${embeddingString}::vector) as distance
      FROM "Food" f
      JOIN "FoodEmbedding" fe ON f.id = fe."foodId"
      ORDER BY distance ASC
      LIMIT ${limit};
    `;

    // 4. Save the result in Redis for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(foods), 3600);

    return foods;
  }
}
