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

export interface UpdateMealEntryDto {
  meal?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  foodId?: string;
  servingQuantity?: number;
  unitName?: string;
  loggedWeightGrams?: number;
  loggedCaloriesKcal?: number;
  loggedProteinG?: number;
  loggedCarbohydratesG?: number;
  loggedFatG?: number;
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

    // 2. Safely verify if foodId exists in PostgreSQL to avoid foreign key constraints
    let validFoodId: string | null = null;
    if (dto.foodId) {
      try {
        const existingFood = await this.prisma.food.findUnique({
          where: { id: dto.foodId },
        });
        if (existingFood) {
          validFoodId = existingFood.id;
        }
      } catch (err) {
        // If dto.foodId is not a valid UUID string, Prisma/Postgres throws an error
        validFoodId = null;
      }
    }

    // 3. Create the entry
    return this.prisma.mealLogEntry.create({
      data: {
        mealLogId: mealLog.id,
        foodId: validFoodId,
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

  async updateEntry(userId: string, entryId: string, dto: UpdateMealEntryDto) {
    const entry = await this.prisma.mealLogEntry.findUnique({
      where: { id: entryId },
      include: { mealLog: true },
    });

    if (!entry) {
      throw new NotFoundException('Meal log entry not found');
    }

    if (entry.mealLog.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this entry');
    }

    let validFoodId: string | null | undefined = undefined;
    if (dto.foodId !== undefined) {
      if (dto.foodId) {
        try {
          const existingFood = await this.prisma.food.findUnique({
            where: { id: dto.foodId },
          });
          validFoodId = existingFood ? existingFood.id : null;
        } catch {
          validFoodId = null;
        }
      } else {
        validFoodId = null;
      }
    }

    return this.prisma.mealLogEntry.update({
      where: { id: entryId },
      data: {
        ...(dto.meal ? { meal: dto.meal } : {}),
        ...(validFoodId !== undefined ? { foodId: validFoodId } : {}),
        ...(dto.servingQuantity !== undefined ? { servingQuantity: dto.servingQuantity } : {}),
        ...(dto.unitName !== undefined ? { unitName: dto.unitName } : {}),
        ...(dto.loggedWeightGrams !== undefined ? { loggedWeightGrams: dto.loggedWeightGrams } : {}),
        ...(dto.loggedCaloriesKcal !== undefined ? { loggedCaloriesKcal: dto.loggedCaloriesKcal } : {}),
        ...(dto.loggedProteinG !== undefined ? { loggedProteinG: dto.loggedProteinG } : {}),
        ...(dto.loggedCarbohydratesG !== undefined ? { loggedCarbohydratesG: dto.loggedCarbohydratesG } : {}),
        ...(dto.loggedFatG !== undefined ? { loggedFatG: dto.loggedFatG } : {}),
      },
      include: {
        food: true,
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
