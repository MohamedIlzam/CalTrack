import { Module } from '@nestjs/common';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FoodModule } from '../food/food.module';

@Module({
  imports: [PrismaModule, FoodModule],
  controllers: [MealController],
  providers: [MealService],
})
export class MealModule {}
