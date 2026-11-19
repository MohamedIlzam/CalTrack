import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DiarySummaryService } from './diary-summary.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AiController],
  providers: [AiService, DiarySummaryService],
  exports: [AiService, DiarySummaryService],
})
export class AiModule {}
