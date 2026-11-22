import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { getLocalDateString, parseLocalDate } from '../common/date.util';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    weightEntry: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    mealLog: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      weightEntry: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      mealLog: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  describe('recordWeight', () => {
    it('throws NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.recordWeight('non-existent-user', 72.5)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.weightEntry.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('creates a WeightEntry and updates user cached weight', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
      prisma.weightEntry.create.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-123',
        weightKg: 72.5,
        recordedAt: new Date(),
      });
      prisma.user.update.mockResolvedValue({ id: 'user-123', weightKg: 72.5 });

      const result = await service.recordWeight('user-123', 72.5);

      expect(prisma.weightEntry.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', weightKg: 72.5 },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { weightKg: 72.5 },
      });
      expect(result.weightKg).toBe(72.5);
    });
  });

  describe('getWeightHistory', () => {
    it('returns weight history ordered by recordedAt asc for specific user', async () => {
      const mockHistory = [
        { id: 'w1', userId: 'user-123', weightKg: 75.0, recordedAt: new Date('2026-11-01') },
        { id: 'w2', userId: 'user-123', weightKg: 74.2, recordedAt: new Date('2026-11-10') },
      ];
      prisma.weightEntry.findMany.mockResolvedValue(mockHistory);

      const history = await service.getWeightHistory('user-123');

      expect(prisma.weightEntry.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { recordedAt: 'asc' },
      });
      expect(history).toEqual(mockHistory);
    });
  });

  describe('getAdherence', () => {
    it('returns exactly 7 days for daysLimit = 7 with correct date ordering', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);

      const result = await service.getAdherence('user-123', 7);

      expect(result.length).toBe(7);
      const todayStr = getLocalDateString();
      expect(result[result.length - 1].date).toBe(todayStr);

      // Verify all unlogged when no records exist
      for (const day of result) {
        expect(day.logged).toBe(false);
        expect(day.calories).toBe(0);
        expect(day.protein).toBe(0);
        expect(day.carbs).toBe(0);
        expect(day.fat).toBe(0);
      }
    });

    it('returns exactly 30 days for daysLimit = 30', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);

      const result = await service.getAdherence('user-123', 30);

      expect(result.length).toBe(30);
      const todayStr = getLocalDateString();
      expect(result[result.length - 1].date).toBe(todayStr);
    });

    it('accurately marks logged: true and sums calories and macros for logged days', async () => {
      const todayStr = getLocalDateString();
      const todayUtc = parseLocalDate(todayStr);

      const mockLogs = [
        {
          id: 'log-today',
          userId: 'user-123',
          date: todayUtc,
          entries: [
            {
              id: 'e1',
              loggedCaloriesKcal: 450,
              loggedProteinG: 25.5,
              loggedCarbohydratesG: 50.2,
              loggedFatG: 12.1,
            },
            {
              id: 'e2',
              loggedCaloriesKcal: 600,
              loggedProteinG: 35.0,
              loggedCarbohydratesG: 65.4,
              loggedFatG: 18.2,
            },
          ],
        },
      ];
      prisma.mealLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getAdherence('user-123', 7);

      const todayEntry = result.find((d) => d.date === todayStr);
      expect(todayEntry).toBeDefined();
      expect(todayEntry?.logged).toBe(true);
      expect(todayEntry?.calories).toBe(1050);
      expect(todayEntry?.protein).toBe(60.5);
      expect(todayEntry?.carbs).toBe(115.6);
      expect(todayEntry?.fat).toBe(30.3);

      // Other days should be logged: false
      const otherDays = result.filter((d) => d.date !== todayStr);
      expect(otherDays.every((d) => !d.logged && d.calories === 0)).toBe(true);
    });

    it('treats mealLog with empty entries array as unlogged (logged: false)', async () => {
      const todayStr = getLocalDateString();
      const todayUtc = parseLocalDate(todayStr);

      const mockLogs = [
        {
          id: 'log-today',
          userId: 'user-123',
          date: todayUtc,
          entries: [], // Empty entries
        },
      ];
      prisma.mealLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getAdherence('user-123', 7);

      const todayEntry = result.find((d) => d.date === todayStr);
      expect(todayEntry).toBeDefined();
      expect(todayEntry?.logged).toBe(false);
      expect(todayEntry?.calories).toBe(0);
    });
  });
});
