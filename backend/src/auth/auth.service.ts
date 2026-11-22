import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Goal, ActivityLevel } from '@prisma/client';
import {
  ACTIVITY_LEVELS,
  GOALS,
  optionalEnum,
  optionalNumber,
} from './auth.validation';

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
    const mappedGoal = optionalEnum(goal, 'goal', GOALS) ?? Goal.LOSE;
    const mappedActivity =
      optionalEnum(activityLevel, 'activityLevel', ACTIVITY_LEVELS) ??
      ActivityLevel.SEDENTARY;

    // Create user with metrics
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        weightKg: optionalNumber(weightKg, 'weightKg', 20, 500) ?? null,
        targetWeightKg:
          optionalNumber(targetWeightKg, 'targetWeightKg', 20, 500) ?? null,
        heightCm: optionalNumber(heightCm, 'heightCm', 80, 250) ?? null,
        goal: mappedGoal,
        activityLevel: mappedActivity,
        targetCalories:
          optionalNumber(targetCalories, 'targetCalories', 500, 10000) ?? null,
        targetProteinG:
          optionalNumber(targetProteinG, 'targetProteinG', 0, 1000) ?? null,
        targetCarbsG:
          optionalNumber(targetCarbsG, 'targetCarbsG', 0, 2000) ?? null,
        targetFatG: optionalNumber(targetFatG, 'targetFatG', 0, 1000) ?? null,
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: any) {
    const dataToUpdate: any = {};

    if (dto.name !== undefined) {
      if (
        typeof dto.name !== 'string' ||
        !dto.name.trim() ||
        dto.name.trim().length > 100
      ) {
        throw new BadRequestException(
          'Name must be between 1 and 100 characters',
        );
      }
      dataToUpdate.name = dto.name.trim();
    }
    const numericFields = [
      ['weightKg', 20, 500],
      ['targetWeightKg', 20, 500],
      ['heightCm', 80, 250],
      ['targetCalories', 500, 10000],
      ['targetProteinG', 0, 1000],
      ['targetCarbsG', 0, 2000],
      ['targetFatG', 0, 1000],
    ] as const;
    for (const [field, minimum, maximum] of numericFields) {
      if (dto[field] !== undefined) {
        dataToUpdate[field] = optionalNumber(
          dto[field],
          field,
          minimum,
          maximum,
        );
      }
    }
    if (dto.goal !== undefined) {
      dataToUpdate.goal = optionalEnum(dto.goal, 'goal', GOALS);
    }
    if (dto.activityLevel !== undefined) {
      dataToUpdate.activityLevel = optionalEnum(
        dto.activityLevel,
        'activityLevel',
        ACTIVITY_LEVELS,
      );
    }
    if (dto.timezone !== undefined) {
      if (
        typeof dto.timezone !== 'string' ||
        dto.timezone.length > 64 ||
        !Intl.supportedValuesOf('timeZone').includes(dto.timezone)
      ) {
        throw new BadRequestException(
          'timezone must be a valid IANA time zone',
        );
      }
      dataToUpdate.timezone = dto.timezone;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}
