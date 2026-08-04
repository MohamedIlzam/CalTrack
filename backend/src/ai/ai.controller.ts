import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
