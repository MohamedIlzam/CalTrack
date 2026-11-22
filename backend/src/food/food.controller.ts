import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('food')
@UseGuards(JwtAuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    if (typeof query !== 'string' || query.trim().length > 120) {
      throw new BadRequestException('q must be between 1 and 120 characters');
    }
    return this.foodService.searchFoods(query);
  }
}
