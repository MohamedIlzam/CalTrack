import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Goal, ActivityLevel } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const {
      email,
      password,
      name,
      // Onboarding profile metrics
      weightKg,
      targetWeightKg,
      heightCm,
      goal,
      activityLevel,
      // Targets
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatG,
    } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Map onboarding goal & activity string values to Prisma Enums
    const mappedGoal = goal ? goal.toUpperCase() as Goal : Goal.LOSE;
    const mappedActivity = activityLevel ? activityLevel.toUpperCase() as ActivityLevel : ActivityLevel.SEDENTARY;

    // Create user with metrics
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        goal: mappedGoal,
        activityLevel: mappedActivity,
        targetCalories: targetCalories ? parseInt(targetCalories, 10) : null,
        targetProteinG: targetProteinG ? parseInt(targetProteinG, 10) : null,
        targetCarbsG: targetCarbsG ? parseInt(targetCarbsG, 10) : null,
        targetFatG: targetFatG ? parseInt(targetFatG, 10) : null,
      },
    });

    // Generate JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weightKg: user.weightKg,
        targetWeightKg: user.targetWeightKg,
        heightCm: user.heightCm,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories,
        targetProteinG: user.targetProteinG,
        targetCarbsG: user.targetCarbsG,
        targetFatG: user.targetFatG,
      },
    };
  }

  async login(dto: any) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weightKg: user.weightKg,
        targetWeightKg: user.targetWeightKg,
        heightCm: user.heightCm,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories,
        targetProteinG: user.targetProteinG,
        targetCarbsG: user.targetCarbsG,
        targetFatG: user.targetFatG,
      },
    };
  }
}
