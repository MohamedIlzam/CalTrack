import { Test, TestingModule } from '@nestjs/testing';
import { FoodService } from './food.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('FoodService (Relevance, Typo-Tolerance & Cache Safety)', () => {
  let service: FoodService;
  let prisma: { $queryRaw: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock };

  // Sample catalog foods mock
  const mockCatalogFoods = [
    {
      id: 'egg-hopper-id',
      name: 'Egg Hopper',
      category: 'Rice & Bread',
      caloriesKcal: 160,
      proteinG: 8,
      carbohydratesG: 18,
      fatG: 6,
      isVerified: true,
      unitConversions: [{ unitName: 'piece', gramEquivalent: 100 }],
      aliases: ['Biththara Appa', 'බිත්තර ආප්ප'],
      distance: 0.25,
    },
    {
      id: 'chicken-curry-id',
      name: 'Chicken Curry',
      category: 'Curries',
      caloriesKcal: 180,
      proteinG: 22,
      carbohydratesG: 4,
      fatG: 9,
      isVerified: true,
      unitConversions: [{ unitName: 'piece', gramEquivalent: 120 }],
      aliases: ['Kukul Mas Curry', 'කුකුල් මස් කරිය', 'கோழி கறி'],
      distance: 0.54,
    },
    {
      id: 'dhal-curry-id',
      name: 'Dhal Curry',
      category: 'Curries',
      caloriesKcal: 130,
      proteinG: 9,
      carbohydratesG: 17,
      fatG: 3,
      isVerified: true,
      unitConversions: [{ unitName: 'cup', gramEquivalent: 150 }],
      aliases: ['Parippu', 'Lentil Curry'],
      distance: 0.34,
    },
    {
      id: 'banana-ambul-id',
      name: 'Banana (Ambul)',
      category: 'Extras',
      caloriesKcal: 90,
      proteinG: 1.1,
      carbohydratesG: 23,
      fatG: 0.3,
      isVerified: true,
      unitConversions: [{ unitName: 'piece', gramEquivalent: 100 }],
      aliases: ['Ambul Kesel'],
      distance: 0.68, // Distance exceeds 0.60
    },
    {
      id: 'ulundu-vadai-id',
      name: 'Ulundu Vadai',
      category: 'Extras',
      caloriesKcal: 150,
      proteinG: 4,
      carbohydratesG: 16,
      fatG: 7,
      isVerified: true,
      unitConversions: [{ unitName: 'piece', gramEquivalent: 60 }],
      aliases: ['Medu Vada'],
      distance: 0.65, // Distance exceeds 0.60
    },
  ];

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue(mockCatalogFoods),
    };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);

    // Mock the Xenova embedding generator to avoid downloading/running model in unit tests
    (service as any).generateEmbedding = jest.fn().mockResolvedValue({
      data: new Float32Array(384).fill(0.01),
    });
  });

  describe('Relevance and Cutoff Policy', () => {
    it('returns empty array [] for empty or whitespace-only query without querying database', async () => {
      const res = await service.searchFoods('   ');
      expect(res).toEqual([]);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('returns empty array [] for nonsense queries where all foods exceed distance threshold and lack text matches', async () => {
      // For nonsense query 'asdasda', simulate high distances across all database items
      prisma.$queryRaw.mockResolvedValueOnce([
        { ...mockCatalogFoods[0], distance: 0.72 },
        { ...mockCatalogFoods[1], distance: 0.68 },
        { ...mockCatalogFoods[2], distance: 0.66 },
        { ...mockCatalogFoods[3], distance: 0.67 },
        { ...mockCatalogFoods[4], distance: 0.644 },
      ]);

      const results = await service.searchFoods('asdasda');
      expect(results).toEqual([]);
      expect(redis.set).toHaveBeenCalledWith(
        'search:v2:food:asdasda',
        JSON.stringify([]),
        3600,
      );
    });

    it('returns relevant foods when cosine distance is within threshold (<= 0.60)', async () => {
      const results = await service.searchFoods('Egg Hopper');
      expect(results.length).toBeGreaterThan(0);
      const names = results.map((f: any) => f.name);
      expect(names).toContain('Egg Hopper');
      expect(names).not.toContain('Ulundu Vadai');
    });

    it('sanitizes returned food objects by stripping internal aliases and raw distance', async () => {
      const results = await service.searchFoods('Egg Hopper');
      const first = results[0];
      expect(first.id).toBe('egg-hopper-id');
      expect(first.name).toBe('Egg Hopper');
      expect(first.unitConversions).toBeDefined();
      expect((first as any).aliases).toBeUndefined();
      expect((first as any).distance).toBeUndefined();
    });
  });

  describe('Typo Tolerance and Alias Matching', () => {
    it('matches food via typo tolerance (e.g. "chiken" matches "Chicken Curry")', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([
        { ...mockCatalogFoods[1], distance: 0.76 }, // pure vector distance is high due to typo
        { ...mockCatalogFoods[3], distance: 0.75 },
      ]);

      const results = await service.searchFoods('chiken');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Chicken Curry');
    });

    it('matches food via alias lookup (e.g. "parippu" matches "Dhal Curry")', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([
        { ...mockCatalogFoods[2], distance: 0.63 }, // distance slightly above 0.60
      ]);

      const results = await service.searchFoods('parippu');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Dhal Curry');
    });
  });

  describe('Redis Caching & Versioning', () => {
    it('uses versioned cache key "search:v2:food:..." to prevent stale result leakage', async () => {
      await service.searchFoods('dhal');
      expect(redis.get).toHaveBeenCalledWith('search:v2:food:dhal');
      expect(redis.set).toHaveBeenCalledWith(
        'search:v2:food:dhal',
        expect.any(String),
        3600,
      );
    });

    it('serves cached results immediately without invoking embedding generator or database', async () => {
      const cached = [{ id: 'cached-1', name: 'Cached Hopper' }];
      redis.get.mockResolvedValueOnce(JSON.stringify(cached));

      const results = await service.searchFoods('hopper');
      expect(results).toEqual(cached);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
      expect((service as any).generateEmbedding).not.toHaveBeenCalled();
    });

    it('gracefully survives Redis failure without crashing search', async () => {
      redis.get.mockRejectedValueOnce(new Error('Redis connection refused'));
      redis.set.mockRejectedValueOnce(new Error('Redis connection refused'));

      const results = await service.searchFoods('Egg Hopper');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Egg Hopper');
    });
  });
});
