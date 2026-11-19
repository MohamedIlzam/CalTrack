import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

@Injectable()
export class FoodService implements OnModuleInit {
  private generateEmbedding: any;
  private readonly logger = new Logger(FoodService.name);

  // Maximum allowed cosine distance for semantic vector matches
  // Calibrated against catalog: genuine semantic matches range 0.25 - 0.58;
  // nonsense queries (e.g. 'asdasda', 'qwertyuiop') produce distances >= 0.64.
  public static readonly COSINE_DISTANCE_THRESHOLD = 0.60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    this.logger.log('Loading AI embedding model for semantic search...');
    // Dynamic import to avoid CommonJS/Jest top-level ESM module parsing conflicts
    const { pipeline } = await import('@xenova/transformers');
    this.generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    this.logger.log('AI embedding model loaded successfully!');
  }

  async searchFoods(query: string, limit: number = 20) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    // Cache versioning (v2) safely invalidates prior unbounded search results
    const cacheKey = `search:v2:food:${cleanQuery}`;
    
    // 1. Check Redis Cache first (for sub-50ms responses on common queries)
    try {
      const cachedResult = await this.redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
    } catch (err: any) {
      this.logger.warn(`Redis cache get error for query "${cleanQuery}": ${err.message}`);
    }

    // 2. Generate vector embedding for the search query
    let embeddingString: string;
    try {
      const output = await this.generateEmbedding(cleanQuery, { pooling: 'mean', normalize: true });
      const embeddingArray = Array.from(output.data);
      embeddingString = JSON.stringify(embeddingArray);
    } catch (err: any) {
      this.logger.error(`Embedding generation failed for query "${cleanQuery}": ${err.message}`);
      return [];
    }

    // 3. Query PostgreSQL using pgvector's cosine distance (<=>)
    // Join UnitConversions for portion sizes and FoodAlias for multilingual / alternate naming
    const foods: any[] = await this.prisma.$queryRaw`
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
        (
          SELECT json_agg(fa."aliasName")
          FROM "FoodAlias" fa WHERE fa."foodId" = f.id
        ) as "aliases",
        (fe.embedding <=> ${embeddingString}::vector) as distance
      FROM "Food" f
      JOIN "FoodEmbedding" fe ON f.id = fe."foodId"
      ORDER BY distance ASC;
    `;

    // 4. Relevance & Typo Filtering Policy
    const qTokens = cleanQuery.split(/\s+/).filter(Boolean);
    const scoredFoods: Array<{ food: any; score: number }> = [];

    for (const item of foods) {
      const dist = Number(item.distance);
      const nameLower = item.name.toLowerCase();
      const aliases = ((item.aliases as string[]) || []).map((a) => a.toLowerCase());
      const allNames = [nameLower, ...aliases];

      // Exact phrase match in food name or alias
      const exactMatch = allNames.some((n) => n === cleanQuery);
      // Substring match in food name or alias
      const substringMatch = allNames.some((n) => n.includes(cleanQuery) || cleanQuery.includes(n));

      // Token overlap and typo tolerance
      const tokenMatch = qTokens.some((token) => {
        if (token.length < 3) return false;
        return allNames.some((n) => {
          const words = n.split(/\s+/);
          return words.some((w) => {
            if (w === token) return true;
            // 1-character typo tolerance for tokens >= 4 chars (e.g. "chiken" <-> "chicken")
            if (token.length >= 4 && w.length >= 4 && levenshteinDistance(token, w) <= 1) return true;
            // 2-character typo tolerance for tokens >= 6 chars (e.g. "chikcen" <-> "chicken")
            if (token.length >= 6 && w.length >= 6 && levenshteinDistance(token, w) <= 2) return true;
            return false;
          });
        });
      });

      // Strict cutoff:
      // Include food only if:
      // - Cosine distance is within calibrated semantic threshold (<= 0.60)
      // - OR direct exact / substring match
      // - OR token match with typo tolerance
      if (dist <= FoodService.COSINE_DISTANCE_THRESHOLD || exactMatch || substringMatch || tokenMatch) {
        let score = dist;
        if (exactMatch) score = Math.min(score, 0.10);
        else if (substringMatch) score = Math.min(score, 0.25);
        else if (tokenMatch) score = Math.min(score, 0.35);

        // Sanitize object before returning (strip internal aliases and raw distance)
        const { aliases: _, distance: __, ...cleanFood } = item;
        scoredFoods.push({ food: cleanFood, score });
      }
    }

    // Sort by relevance score ascending (most relevant first)
    scoredFoods.sort((a, b) => a.score - b.score);
    const finalResults = scoredFoods.slice(0, limit).map((s) => s.food);

    // 5. Save the result in Redis (v2) for 1 hour
    try {
      await this.redis.set(cacheKey, JSON.stringify(finalResults), 3600);
    } catch (err: any) {
      this.logger.warn(`Redis cache set error for query "${cleanQuery}": ${err.message}`);
    }

    return finalResults;
  }
}
