import { BadRequestException } from '@nestjs/common';
import { ActivityLevel, Goal } from '@prisma/client';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('A valid email address is required');
  }
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new BadRequestException('A valid email address is required');
  }
  return email;
}

export function validateLoginPassword(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 128) {
    throw new BadRequestException(
      'Password must be between 1 and 128 characters',
    );
  }
  return value;
}

export function validateRegistrationPassword(value: unknown): string {
  const password = validateLoginPassword(value);
  if (password.length < 10) {
    throw new BadRequestException(
      'Password must be between 10 and 128 characters',
    );
  }
  return password;
}

export function validateName(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('Name is required');
  }
  const name = value.trim();
  if (!name || name.length > 100) {
    throw new BadRequestException('Name must be between 1 and 100 characters');
  }
  return name;
}

export function optionalNumber(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < minimum || numeric > maximum) {
    throw new BadRequestException(
      `${field} must be between ${minimum} and ${maximum}`,
    );
  }
  return numeric;
}

export function optionalEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} is invalid`);
  }
  const normalized = value.toUpperCase() as T;
  if (!allowed.includes(normalized)) {
    throw new BadRequestException(`${field} is invalid`);
  }
  return normalized;
}

export const GOALS = Object.values(Goal);
export const ACTIVITY_LEVELS = Object.values(ActivityLevel);
