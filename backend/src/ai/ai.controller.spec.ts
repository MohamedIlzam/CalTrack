import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DiarySummaryService } from './diary-summary.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('AiController', () => {
  let controller: AiController;
  let mockAiService: any;
  let mockDiarySummaryService: any;
  let mockPrismaService: any;
  let mockRedisService: any;

  const mockUserReq: any = {
    user: {
      id: 'test-user-id',
      email: 'user@caltrack.com',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    mockAiService = {
      askCoach: jest.fn(),
      parsePrompt: jest.fn(),
      scanImage: jest.fn(),
    };

    mockDiarySummaryService = {
      tryHandleCoachDiaryIntent: jest.fn().mockResolvedValue(null),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          name: 'Test User',
          goal: 'Weight Loss',
          targetCalories: 2000,
          targetProteinG: 140,
          targetCarbsG: 200,
          targetFatG: 60,
          weightKg: 72,
        }),
      },
      mealLog: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    mockRedisService = {
      checkRateLimit: jest.fn().mockResolvedValue({
        allowed: true,
        remaining: 14,
        current: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: DiarySummaryService, useValue: mockDiarySummaryService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  describe('Rate Limiting & Fail-Closed Enforcement', () => {
    it('should throw HTTP 429 when user rate limit is exceeded', async () => {
      mockRedisService.checkRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        current: 16,
      });

      await expect(
        controller.chat(mockUserReq, 'Suggest a healthy dinner'),
      ).rejects.toThrow(HttpException);

      try {
        await controller.chat(mockUserReq, 'Suggest a healthy dinner');
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(err.message).toContain('Rate limit reached');
      }

      expect(mockAiService.askCoach).not.toHaveBeenCalled();
    });

    it('should fail closed with HTTP 503 if Redis is unreachable', async () => {
      mockRedisService.checkRateLimit.mockRejectedValue(
        new Error('ECONNREFUSED 127.0.0.1:6379'),
      );

      await expect(
        controller.chat(mockUserReq, 'Suggest a healthy dinner'),
      ).rejects.toThrow(ServiceUnavailableException);

      expect(mockAiService.askCoach).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should reject empty or whitespace chat messages with HTTP 400', async () => {
      await expect(controller.chat(mockUserReq, '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.chat(mockUserReq, '   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject chat messages longer than 1000 characters with HTTP 400', async () => {
      const longMessage = 'a'.repeat(1001);
      await expect(controller.chat(mockUserReq, longMessage)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject empty food prompts with HTTP 400', async () => {
      await expect(controller.parsePrompt(mockUserReq, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject food prompts longer than 500 characters with HTTP 400', async () => {
      const longPrompt = 'a'.repeat(501);
      await expect(controller.parsePrompt(mockUserReq, longPrompt)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject unsupported image MIME types with HTTP 400', async () => {
      const gifPayload = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      await expect(controller.scanImage(mockUserReq, gifPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject image payloads exceeding 7MB with HTTP 400', async () => {
      const hugeImagePayload = 'data:image/jpeg;base64,' + 'A'.repeat(7000001);
      await expect(controller.scanImage(mockUserReq, hugeImagePayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Coach Diary Intent Routing (Fix 2)', () => {
    it('should intercept today diary questions locally without calling Gemini Coach', async () => {
      mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue({
        reply: "Here is what you've logged today (**2026-11-20**):\n* **Calories:** 500 kcal",
      });

      const res = await controller.chat(mockUserReq, 'What did I have today?');

      expect(mockDiarySummaryService.tryHandleCoachDiaryIntent).toHaveBeenCalledWith(
        'test-user-id',
        'What did I have today?',
        undefined,
        undefined,
      );
      expect(mockAiService.askCoach).not.toHaveBeenCalled();
      expect(res.reply).toContain("Here is what you've logged today");
    });

    it('should route general nutrition questions to Gemini Coach when diary intent returns null', async () => {
      mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue(null);
      mockAiService.askCoach.mockResolvedValue({ reply: 'Healthy eating tip' });

      const res = await controller.chat(mockUserReq, 'Suggest a healthy dinner');

      expect(mockDiarySummaryService.tryHandleCoachDiaryIntent).toHaveBeenCalled();
      expect(mockAiService.askCoach).toHaveBeenCalledWith('Suggest a healthy dinner', undefined);
      expect(res.reply).toBe('Healthy eating tip');
    });

    it('should strictly exclude real user profile and diary records from Gemini by default', async () => {
      mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue(null);
      mockAiService.askCoach.mockResolvedValue({ reply: 'Healthy eating tip' });

      await controller.chat(mockUserReq, 'Suggest a healthy dinner');

      expect(mockAiService.askCoach).toHaveBeenCalledWith('Suggest a healthy dinner', undefined);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.mealLog.findUnique).not.toHaveBeenCalled();
    });

    it('should pass only static synthetic demo fixtures when includeDemoContext is enabled', async () => {
      mockDiarySummaryService.tryHandleCoachDiaryIntent.mockResolvedValue(null);
      mockAiService.askCoach.mockResolvedValue({ reply: 'Healthy eating tip' });

      await controller.chat(mockUserReq, 'Suggest a healthy dinner', true);

      expect(mockAiService.askCoach).toHaveBeenCalled();
      const demoArg = mockAiService.askCoach.mock.calls[0][1];
      expect(demoArg).toBeDefined();
      expect(demoArg.isSyntheticDemo).toBe(true);
      expect(demoArg.goal).toContain('Synthetic Demo Archetype');
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
