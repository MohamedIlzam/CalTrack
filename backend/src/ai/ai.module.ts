import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DiarySummaryService } from './diary-summary.service';
import { NutritionToolsService } from './intelligence/nutrition-tools.service';
import { ToolDispatcherService } from './intelligence/tool-dispatcher.service';
import { GeminiFunctionCallingService } from './intelligence/gemini-function-calling.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AiController],
  providers: [
    AiService,
    DiarySummaryService,
    NutritionToolsService,
    ToolDispatcherService,
    GeminiFunctionCallingService,
  ],
  exports: [
    AiService,
    DiarySummaryService,
    NutritionToolsService,
    ToolDispatcherService,
    GeminiFunctionCallingService,
  ],
})
export class AiModule {}
