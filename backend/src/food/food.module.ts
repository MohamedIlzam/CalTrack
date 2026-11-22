import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [FoodController],
  providers: [FoodService, NutritionCalculatorService],
  exports: [FoodService, NutritionCalculatorService],
})
export class FoodModule {}
