import { BadRequestException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  normalizeEmail,
  validateLoginPassword,
  validateRegistrationPassword,
} from './auth.validation';

describe('Authentication security boundaries', () => {
  it('normalizes email and bounds password work before bcrypt', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
    expect(() => normalizeEmail('not-an-email')).toThrow(BadRequestException);
    expect(() => validateRegistrationPassword('short')).toThrow(
      BadRequestException,
    );
    expect(() => validateLoginPassword('x'.repeat(129))).toThrow(
      BadRequestException,
    );
  });

  it('rate limits repeated login attempts without storing the email in the key', async () => {
    const authService = { login: jest.fn() };
    const redisService = {
      checkRateLimit: jest
        .fn()
        .mockResolvedValueOnce({ allowed: false })
        .mockResolvedValueOnce({ allowed: true }),
    };
    const controller = new AuthController(
      authService as any,
      redisService as any,
    );

    await expect(
      controller.login({ email: 'victim@example.com', password: 'password' }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(authService.login).not.toHaveBeenCalled();
    expect(redisService.checkRateLimit.mock.calls[0][0]).not.toContain(
      'victim@example.com',
    );
  });

  it('fails closed when the authentication rate-limit store is unavailable', async () => {
    const controller = new AuthController(
      { login: jest.fn() } as any,
      {
        checkRateLimit: jest.fn().mockRejectedValue(new Error('unavailable')),
      } as any,
    );
    await expect(
      controller.login({ email: 'user@example.com', password: 'password' }),
    ).rejects.toMatchObject({ status: 503 });
  });

  it('hashes passwords and never returns the password hash', async () => {
    let createdData: any;
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => {
          createdData = data;
          return { id: 'user-1', ...data };
        }),
      },
    };
    const service = new AuthService(
      prisma as any,
      {
        sign: jest.fn().mockReturnValue('signed-token'),
      } as any,
    );

    const result = await service.register({
      email: 'user@example.com',
      password: 'long-password',
      name: 'User',
    });

    expect(createdData.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain('long-password');
  });

  it('rejects expired, forged, and malformed JWTs', () => {
    const secret = 'test-secret-with-at-least-thirty-two-characters';
    const jwt = new JwtService({ secret, signOptions: { algorithm: 'HS256' } });
    const expired = jwt.sign({ sub: 'user-1' }, { expiresIn: -1 });
    const forged = new JwtService({
      secret: 'different-secret-with-at-least-thirty-two-characters',
    }).sign({ sub: 'user-1' });

    expect(() => jwt.verify(expired, { algorithms: ['HS256'] })).toThrow();
    expect(() => jwt.verify(forged, { algorithms: ['HS256'] })).toThrow();
    expect(() => jwt.verify('not-a-jwt', { algorithms: ['HS256'] })).toThrow();
  });
});
