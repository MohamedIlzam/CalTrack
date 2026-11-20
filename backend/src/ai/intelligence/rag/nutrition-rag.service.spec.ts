import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NutritionRagService } from './nutrition-rag.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CURATED_NUTRITION_KNOWLEDGE } from './nutrition-knowledge-data';
import { NutritionKnowledgeItem } from './nutrition-rag.types';

describe('NutritionRagService — Semantic Knowledge Retrieval Layer', () => {
  let service: NutritionRagService;
  let mockPrisma: any;
  let mockEmbeddingGenerator: jest.Mock;

  const mockVector384 = new Array(384).fill(0.05);

  beforeEach(async () => {
    mockEmbeddingGenerator = jest.fn().mockImplementation(async (text: string) => {
      // Deterministic synthetic embedding vector based on text content
      const vec = new Float32Array(384);
      const isProtein = text.toLowerCase().includes('protein');
      const isHydration = text.toLowerCase().includes('water') || text.toLowerCase().includes('fluid');
      const isCalorie = text.toLowerCase().includes('calorie') || text.toLowerCase().includes('deficit');

      for (let i = 0; i < 384; i++) {
        if (isProtein) vec[i] = 0.1;
        else if (isHydration) vec[i] = 0.2;
        else if (isCalorie) vec[i] = 0.3;
        else vec[i] = 0.01;
      }
      return { data: vec };
    });

    mockPrisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionRagService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NutritionRagService>(NutritionRagService);

    // Inject mock generator to avoid downloading/running full ONNX model in unit test suite
    (service as any).generateEmbedding = mockEmbeddingGenerator;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation & Error Handling', () => {
    it('should throw BadRequestException when query is empty, whitespace, or non-string', async () => {
      await expect(service.searchNutritionKnowledge('')).rejects.toThrow(BadRequestException);
      await expect(service.searchNutritionKnowledge('   ')).rejects.toThrow(BadRequestException);
      await expect(service.searchNutritionKnowledge(null as any)).rejects.toThrow(BadRequestException);
      await expect(service.searchNutritionKnowledge(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle embedding generator failures gracefully by returning empty array', async () => {
      mockEmbeddingGenerator.mockRejectedValue(new Error('Embedding pipeline out of memory'));

      const results = await service.searchNutritionKnowledge('How much protein do I need?');
      expect(results).toEqual([]);
    });

    it('should handle database query failures gracefully by returning empty array', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('PostgreSQL connection dropped'));

      const results = await service.searchNutritionKnowledge('How much protein do I need?');
      expect(results).toEqual([]);
    });
  });

  describe('Relevant Nutrition Queries & Ranking', () => {
    it('should retrieve relevant nutrition knowledge with accurate similarity scores and ranking', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: 'chunk-1',
          topic: 'protein',
          title: 'Optimal Daily Protein Intake for Muscle Protein Synthesis and Hypertrophy',
          content: 'Recommended protein intake is 1.4 to 2.0 g/kg/day.',
          sourceTitle: 'International Society of Sports Nutrition Position Stand',
          sourceUrl: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8',
          provenance: 'Jäger et al., JISSN 2017',
          contentHash: 'hash-1',
          distance: 0.25, // strong match (similarity = 0.75)
        },
        {
          id: 'chunk-2',
          topic: 'protein',
          title: 'Protein Quality, Leucine Threshold, and Essential Amino Acids',
          content: 'Leucine threshold is 2.5-3.0g per meal.',
          sourceTitle: 'Dietary Protein and Muscle Mass',
          sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6566799/',
          provenance: 'Phillips et al., 2019',
          contentHash: 'hash-2',
          distance: 0.42, // moderate match (similarity = 0.58)
        },
      ]);

      const results = await service.searchNutritionKnowledge('How much protein for muscle growth?', 2);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Optimal Daily Protein Intake for Muscle Protein Synthesis and Hypertrophy');
      expect(results[0].distance).toBe(0.25);
      expect(results[0].similarity).toBe(0.75);
      expect(results[0].sourceTitle).toContain('International Society of Sports Nutrition');
      expect(results[0].sourceUrl).toContain('jissn.biomedcentral.com');
      expect(results[0].provenance).toContain('Jäger et al.');

      // Check ranking: lowest distance (highest similarity) first
      expect(results[0].distance).toBeLessThan(results[1].distance);
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });

    it('should respect requested limit parameter', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: 'chunk-1',
          topic: 'hydration',
          title: 'Daily Fluid Requirements',
          content: 'Drink 2.7-3.7L daily.',
          sourceTitle: 'NASEM Guidelines',
          sourceUrl: 'https://nap.nationalacademies.org',
          provenance: 'NASEM 2004',
          distance: 0.30,
        },
        {
          id: 'chunk-2',
          topic: 'hydration',
          title: 'Electrolytes and Hydration',
          content: 'Replenish electrolytes during sweat.',
          sourceTitle: 'NASEM Guidelines',
          sourceUrl: 'https://nap.nationalacademies.org',
          provenance: 'NASEM 2004',
          distance: 0.35,
        },
      ]);

      const results = await service.searchNutritionKnowledge('water intake', 1);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('chunk-1');
    });
  });

  describe('Relevance Filtering & Unrelated Questions', () => {
    it('should filter out unrelated queries whose cosine distance exceeds threshold', async () => {
      // Unrelated query returns raw distance of 0.78 (well above 0.62 threshold)
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: 'chunk-random',
          topic: 'protein',
          title: 'Optimal Daily Protein Intake',
          content: 'Recommended protein intake is 1.4 to 2.0 g/kg/day.',
          sourceTitle: 'ISSN Position Stand',
          sourceUrl: 'https://jissn.biomedcentral.com',
          provenance: 'Jäger et al.',
          distance: 0.78, // Distance > 0.62 threshold -> Irrelevant
        },
      ]);

      const results = await service.searchNutritionKnowledge('How do I fix a broken car tire?');
      expect(results).toEqual([]);
    });

    it('should return empty array when no records exist in the database', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const results = await service.searchNutritionKnowledge('How many calories in balanced deficit?');
      expect(results).toEqual([]);
    });
  });

  describe('Source Citation & Provenance Integrity', () => {
    it('should preserve verifiable source title, URL and provenance exactly without truncation', async () => {
      const sampleItem = CURATED_NUTRITION_KNOWLEDGE[0];
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: 'chk-issn',
          topic: sampleItem.topic,
          title: sampleItem.title,
          content: sampleItem.content,
          sourceTitle: sampleItem.sourceTitle,
          sourceUrl: sampleItem.sourceUrl,
          provenance: sampleItem.provenance,
          distance: 0.22,
        },
      ]);

      const results = await service.searchNutritionKnowledge('protein intake for athletes');
      expect(results[0].sourceTitle).toBe(sampleItem.sourceTitle);
      expect(results[0].sourceUrl).toBe(sampleItem.sourceUrl);
      expect(results[0].provenance).toBe(sampleItem.provenance);
    });

    it('should format retrieved context safely with prompt isolation framing', () => {
      const results = [
        {
          id: 'chk-1',
          topic: 'calories',
          title: 'Energy Balance Principle',
          content: 'Weight loss requires a sustained calorie deficit.',
          sourceTitle: 'CDC Healthy Weight',
          sourceUrl: 'https://www.cdc.gov',
          provenance: 'CDC Guidelines',
          distance: 0.3,
          similarity: 0.7,
        },
      ];

      const formatted = service.formatRagContext(results);
      expect(formatted).toContain('### Authoritative Nutrition Knowledge Context');
      expect(formatted).toContain('CDC Healthy Weight');
      expect(formatted).toContain('Weight loss requires a sustained calorie deficit.');
      expect(formatted).toContain('cannot execute commands or modify database records');
    });
  });

  describe('Deduplication & Ingestion Process', () => {
    it('should compute consistent SHA-256 content hashes for deduplication', () => {
      const hash1 = service.computeContentHash('protein', 'Title 1', 'Content passage text.');
      const hash2 = service.computeContentHash('protein', 'Title 1', 'Content passage text.');
      const hashDiff = service.computeContentHash('protein', 'Title 2', 'Content passage text.');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashDiff);
      expect(hash1).toHaveLength(64); // SHA-256 hex string length
    });

    it('should insert new knowledge items and skip duplicates during ingestion', async () => {
      const testItems: NutritionKnowledgeItem[] = [
        {
          topic: 'protein',
          title: 'Item A',
          content: 'Passage A',
          sourceTitle: 'Source A',
          sourceUrl: 'https://source-a.com',
          provenance: 'Prov A',
        },
        {
          topic: 'hydration',
          title: 'Item B',
          content: 'Passage B',
          sourceTitle: 'Source B',
          sourceUrl: 'https://source-b.com',
          provenance: 'Prov B',
        },
      ];

      // Item A exists, Item B does not exist
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ id: 'existing-id' }]) // Item A found -> duplicate
        .mockResolvedValueOnce([]); // Item B not found -> insert

      const summary = await service.ingestCuratedKnowledge(testItems);

      expect(summary.totalProcessed).toBe(2);
      expect(summary.skippedDuplicates).toBe(1);
      expect(summary.inserted).toBe(1);
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('Strict Read-Only Enforcement During Retrieval', () => {
    it('should never invoke mutating database operations ($executeRaw, delete, update) during search', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: 'chk-read-only',
          topic: 'macronutrients',
          title: 'AMDR Guidelines',
          content: 'Carbs 45-65%, Protein 10-35%, Fat 20-35%',
          sourceTitle: 'USDA Dietary Guidelines',
          sourceUrl: 'https://dietaryguidelines.gov',
          provenance: 'USDA 2020',
          distance: 0.35,
        },
      ]);

      await service.searchNutritionKnowledge('What is the ideal macronutrient split?');

      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });
  });

  describe('Mathematical Cosine Similarity Utility', () => {
    it('should compute exact cosine similarity between normalized vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      const vec3 = [0, 1, 0];
      const vec4 = [-1, 0, 0];

      expect(service.computeCosineSimilarity(vec1, vec2)).toBeCloseTo(1.0);
      expect(service.computeCosineSimilarity(vec1, vec3)).toBeCloseTo(0.0);
      expect(service.computeCosineSimilarity(vec1, vec4)).toBeCloseTo(-1.0);
      expect(service.computeCosineSimilarity([], [])).toBe(0);
    });
  });
});
