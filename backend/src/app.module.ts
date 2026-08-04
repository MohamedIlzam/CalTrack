import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProgressModule } from './progress/progress.module';
import { FoodModule } from './food/food.module';
import { RedisModule } from './redis/redis.module';
import { MealModule } from './meal/meal.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, ProgressModule, FoodModule, RedisModule, MealModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
