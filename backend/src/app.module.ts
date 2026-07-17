import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProgressModule } from './progress/progress.module';
import { FoodModule } from './food/food.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, AuthModule, ProgressModule, FoodModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
