import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { NutritionCalculatorService } from '../food/nutrition-calculator.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('HTTP Integration - POST /meal/preview', () => {
  let app: INestApplication;
  let mockPrisma: any;
  let mockMealService: any;
  let isAuthenticated = true;

  const hopperFood = {
    id: 'f-hopper-uuid',
    name: 'Egg Hopper',
    category: 'Rice & Bread',
    isVerified: true,
    caloriesKcal: 188.235,
    proteinG: 9.412,
    carbohydratesG: 21.176,
    fatG: 7.059,
    unitConversions: [
      { id: 'uc-1', foodId: 'f-hopper-uuid', unitName: 'piece', gramEquivalent: 85, isStandard: true },
    ],
  };

  const dhalFood = {
    id: 'f-dhal-uuid',
    name: 'Dhal Curry',
    category: 'Curries',
    isVerified: true,
    caloriesKcal: 120.0,
    proteinG: 6.0,
    carbohydratesG: 16.667,
    fatG: 3.333,
    unitConversions: [
      { id: 'uc-2', foodId: 'f-dhal-uuid', unitName: 'cup', gramEquivalent: 150, isStandard: true },
    ],
  };

  beforeAll(async () => {
    mockPrisma = {
      food: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const ids: string[] = where?.id?.in || [];
          const matched = [hopperFood, dhalFood].filter((f) => ids.includes(f.id));
          return Promise.resolve(matched);
        }),
      },
    };

    mockMealService = {
      getDailyLog: jest.fn(),
      logFood: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        NutritionCalculatorService,
        { provide: MealService, useValue: mockMealService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          const authHeader = req.headers['authorization'];
          if (!authHeader || !authHeader.startsWith('Bearer valid-token')) {
            throw new UnauthorizedException('Missing or invalid bearer token');
          }
          req.user = { id: 'test-user-uuid', email: 'test@caltrack.com' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Check 1: Unauthenticated request returns 401 Unauthorized
  it('Returns 401 Unauthorized when no Authorization header is provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .send({
        items: [{ foodId: hopperFood.id, quantity: 1, unitName: 'piece' }],
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Missing or invalid bearer token');
  });

  // Check 2: Authenticated request returns 201 with authoritative preview
  it('Returns 201 with authoritative nutrition preview on authenticated request', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({
        items: [
          { foodId: hopperFood.id, quantity: 2, unitName: 'piece' },
          { foodId: dhalFood.id, quantity: 1, unitName: 'cup' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('totals');

    expect(res.body.items).toHaveLength(2);

    // Hopper (2 pieces = 170g): 320 kcal, 16g P, 36g C, 12g F
    expect(res.body.items[0]).toEqual({
      foodId: hopperFood.id,
      name: 'Egg Hopper',
      quantity: 2,
      unitName: 'piece',
      grams: 170,
      caloriesKcal: 320,
      proteinG: 16,
      carbohydratesG: 36,
      fatG: 12,
      isVerified: true,
    });

    // Dhal (1 cup = 150g): 180 kcal, 9g P, 25g C, 5g F
    expect(res.body.items[1]).toEqual({
      foodId: dhalFood.id,
      name: 'Dhal Curry',
      quantity: 1,
      unitName: 'cup',
      grams: 150,
      caloriesKcal: 180,
      proteinG: 9,
      carbohydratesG: 25,
      fatG: 5,
      isVerified: true,
    });

    // Totals: 320 + 180 = 500 kcal, 16 + 9 = 25g P, 36 + 25 = 61g C, 12 + 5 = 17g F
    expect(res.body.totals).toEqual({
      caloriesKcal: 500,
      proteinG: 25,
      carbohydratesG: 61,
      fatG: 17,
    });
  });

  // Check 3: Rejects unknown food ID with 404
  it('Returns 404 when food ID is not found in database', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({
        items: [{ foodId: 'f-unknown-uuid', quantity: 1, unitName: 'piece' }],
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Food with ID "f-unknown-uuid" not found');
  });

  // Check 4: Rejects invalid unit with 400
  it('Returns 400 when requested unit does not exist for the food', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({
        items: [{ foodId: hopperFood.id, quantity: 1, unitName: 'gallon' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Unit "gallon" is not valid for food "Egg Hopper"');
  });

  // Check 5: Rejects zero or negative quantity with 400
  it('Returns 400 when quantity is zero or negative', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({
        items: [{ foodId: hopperFood.id, quantity: -1, unitName: 'piece' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('must be greater than zero');
  });

  // Check 6: Rejects empty items array with 400
  it('Returns 400 when items array is empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/meal/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('at least one food item');
  });
});
