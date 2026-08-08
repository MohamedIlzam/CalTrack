import { Controller, Post, Body, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('chat')
  async chat(@Req() req: any, @Body('message') message: string) {
    if (!message || !message.trim()) {
      throw new BadRequestException('message parameter is required');
    }

    const userId = req.user?.id;
    let userContext: any = undefined;
    let todaySummary: any = undefined;

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        userContext = {
          name: user.name,
          goal: user.goal,
          targetCalories: user.targetCalories,
          targetProteinG: user.targetProteinG,
          targetCarbsG: user.targetCarbsG,
          targetFatG: user.targetFatG,
          weightKg: user.weightKg,
        };
      }

      const today = new Date().toISOString().split('T')[0];
      const log = await this.prisma.mealLog.findUnique({
        where: { userId_date: { userId, date: today } },
        include: { entries: true },
      });

      if (log && log.entries) {
        todaySummary = {
          consumedCalories: log.entries.reduce((sum, e) => sum + e.loggedCaloriesKcal, 0),
          consumedProtein: log.entries.reduce((sum, e) => sum + e.loggedProteinG, 0),
          consumedCarbs: log.entries.reduce((sum, e) => sum + e.loggedCarbohydratesG, 0),
          consumedFat: log.entries.reduce((sum, e) => sum + e.loggedFatG, 0),
          mealsCount: log.entries.length,
        };
      }
    }

    return this.aiService.askCoach(message, userContext, todaySummary);
  }

  @Post('parse-prompt')
  async parsePrompt(@Body('prompt') prompt: string) {
    if (!prompt || !prompt.trim()) {
      throw new BadRequestException('prompt parameter is required');
    }
    return this.aiService.parsePrompt(prompt);
  }

  @Post('scan-image')
  async scanImage(@Body('imageBase64') imageBase64: string) {
    if (!imageBase64) {
      throw new BadRequestException('imageBase64 parameter is required');
    }
    return this.aiService.scanImage(imageBase64);
  }
}
