import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealSlot } from '@prisma/client';

export interface LogFoodDto {
  date: string; // YYYY-MM-DD
  foodId?: string;
  meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  servingQuantity: number;
  unitName: string;
  loggedWeightGrams: number;
  loggedCaloriesKcal: number;
  loggedProteinG: number;
  loggedCarbohydratesG: number;
  loggedFatG: number;
}

@Injectable()
export class MealService {
  constructor(private readonly prisma: PrismaService) {}

  private parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create Date in local timezone context (UTC normalized to midnight of local date)
    const date = new Date(Date.UTC(year, month - 1, day));
    return date;
  }

  async getDailyLog(userId: string, dateStr: string) {
    const localDate = this.parseLocalDate(dateStr);

    let mealLog = await this.prisma.mealLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: localDate,
        },
      },
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
    });

    if (!mealLog) {
      mealLog = await this.prisma.mealLog.create({
        data: {
          userId,
          date: localDate,
        },
        include: {
          entries: {
            include: {
              food: true,
            },
          },
        },
      });
    }

    return mealLog;
  }

  async logFood(userId: string, dto: LogFoodDto) {
    const localDate = this.parseLocalDate(dto.date);

    // 1. Ensure MealLog exists for the day
    let mealLog = await this.prisma.mealLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: localDate,
        },
      },
    });

    if (!mealLog) {
      mealLog = await this.prisma.mealLog.create({
        data: {
          userId,
          date: localDate,
        },
      });
    }

    // 2. Create the entry
    return this.prisma.mealLogEntry.create({
      data: {
        mealLogId: mealLog.id,
        foodId: dto.foodId || null,
        meal: dto.meal,
        servingQuantity: dto.servingQuantity,
        unitName: dto.unitName,
        loggedWeightGrams: dto.loggedWeightGrams,
        loggedCaloriesKcal: dto.loggedCaloriesKcal,
        loggedProteinG: dto.loggedProteinG,
        loggedCarbohydratesG: dto.loggedCarbohydratesG,
        loggedFatG: dto.loggedFatG,
      },
    });
  }

  async deleteEntry(userId: string, entryId: string) {
    const entry = await this.prisma.mealLogEntry.findUnique({
      where: { id: entryId },
      include: { mealLog: true },
    });

    if (!entry) {
      throw new NotFoundException('Meal log entry not found');
    }

    if (entry.mealLog.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this entry');
    }

    await this.prisma.mealLogEntry.delete({
      where: { id: entryId },
    });

    return { success: true };
  }
}
