import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getLocalDateString, parseLocalDate } from '../common/date.util';

export interface AdherenceDay {
  date: string;
  logged: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async recordWeight(userId: string, weightKg: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Create a new WeightEntry record
    const weightEntry = await this.prisma.weightEntry.create({
      data: {
        userId,
        weightKg,
      },
    });

    // 2. Cache the current weight on the User profile
    await this.prisma.user.update({
      where: { id: userId },
      data: { weightKg },
    });

    return weightEntry;
  }

  async getWeightHistory(userId: string) {
    return this.prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async getAdherence(userId: string, daysLimit: number): Promise<AdherenceDay[]> {
    const todayStr = getLocalDateString();
    const todayUtc = parseLocalDate(todayStr);

    const startDate = new Date(todayUtc);
    startDate.setUTCDate(startDate.getUTCDate() - daysLimit + 1);

    // Fetch logs from the calculated start date
    const logs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      include: {
        entries: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Generate a uniform array of metrics representing the timeline
    const dailyAdherence: AdherenceDay[] = [];
    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(todayUtc);
      d.setUTCDate(d.getUTCDate() - i);
      const dateString = d.toISOString().split('T')[0];

      // Find if we have database logs matching this date string
      const log = logs.find((l) => {
        const logDateStr = l.date.toISOString().split('T')[0];
        return logDateStr === dateString;
      });

      if (log && log.entries.length > 0) {
        const calories = Math.round(log.entries.reduce((sum, e) => sum + e.loggedCaloriesKcal, 0));
        const protein = Math.round(log.entries.reduce((sum, e) => sum + e.loggedProteinG, 0) * 10) / 10;
        const carbs = Math.round(log.entries.reduce((sum, e) => sum + e.loggedCarbohydratesG, 0) * 10) / 10;
        const fat = Math.round(log.entries.reduce((sum, e) => sum + e.loggedFatG, 0) * 10) / 10;

        dailyAdherence.push({
          date: dateString,
          logged: true,
          calories,
          protein,
          carbs,
          fat,
        });
      } else {
        dailyAdherence.push({
          date: dateString,
          logged: false,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      }
    }

    return dailyAdherence;
  }
}
