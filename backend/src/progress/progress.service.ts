import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit + 1);
    startDate.setHours(0, 0, 0, 0);

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
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const dateString = targetDate.toISOString().split('T')[0];

      // Find if we have database logs matching this date string
      const log = logs.find((l) => {
        const logDateStr = new Date(l.date).toISOString().split('T')[0];
        return logDateStr === dateString;
      });

      if (log) {
        const calories = log.entries.reduce((sum, e) => sum + e.loggedCaloriesKcal, 0);
        const protein = log.entries.reduce((sum, e) => sum + e.loggedProteinG, 0);
        const carbs = log.entries.reduce((sum, e) => sum + e.loggedCarbohydratesG, 0);
        const fat = log.entries.reduce((sum, e) => sum + e.loggedFatG, 0);

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
