import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiController } from './ai.controller';

describe('AiController Gemini-only Coach routing', () => {
  let aiService: any;
  let redis: any;
  let cie: any;
  let controller: AiController;
  const req: any = {
    user: { id: 'authenticated-user', email: 'synthetic@example.test' },
  };

  beforeEach(() => {
    aiService = {
      parsePrompt: jest.fn(),
      scanImage: jest.fn(),
      askCoach: jest.fn(),
    };
    redis = {
      checkRateLimit: jest
        .fn()
        .mockResolvedValue({ allowed: true, remaining: 14, current: 1 }),
    };
    cie = {
      handleCoachMessage: jest.fn().mockResolvedValue({
        reply: 'Gemini response',
        provenance: {
          source: 'gemini',
          label: 'Gemini AI',
          responseAuthor: 'gemini',
        },
      }),
      clearConversation: jest.fn().mockResolvedValue(undefined),
    };
    controller = new AiController(aiService, redis, cie);
  });

  it('routes every valid chat through CIE with authenticated identity and consent metadata', async () => {
    const result = await controller.chat(
      req,
      'How much protein have I consumed today?',
      '2026-11-22',
      'Asia/Colombo',
      true,
      '2026-11-22',
    );
    expect(cie.handleCoachMessage).toHaveBeenCalledWith(
      'authenticated-user',
      'How much protein have I consumed today?',
      '2026-11-22',
      'Asia/Colombo',
      { personalizedConsent: true, consentVersion: '2026-11-22' },
    );
    expect(result.provenance.responseAuthor).toBe('gemini');
    expect(aiService.askCoach).not.toHaveBeenCalled();
  });

  it('does not replace a personalized-mode rejection with local prose', async () => {
    cie.handleCoachMessage.mockRejectedValue(
      new ForbiddenException({
        code: 'PERSONALIZED_GEMINI_REQUIRED',
        message: 'Consent required',
      }),
    );
    await expect(
      controller.chat(req, 'Tell me about myself.'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(aiService.askCoach).not.toHaveBeenCalled();
  });

  it('does not replace Gemini outage with a deterministic Coach reply', async () => {
    cie.handleCoachMessage.mockRejectedValue(
      new ServiceUnavailableException('AI unavailable'),
    );
    await expect(controller.chat(req, 'Prawn curry')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(aiService.askCoach).not.toHaveBeenCalled();
  });

  it('rejects invalid chat messages before model routing', async () => {
    await expect(controller.chat(req, '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(controller.chat(req, 'x'.repeat(1001))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(cie.handleCoachMessage).not.toHaveBeenCalled();
  });

  it('enforces rate limits before model routing', async () => {
    redis.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      current: 16,
    });
    await expect(controller.chat(req, 'Prawn curry')).rejects.toMatchObject({
      status: 429,
    });
    expect(cie.handleCoachMessage).not.toHaveBeenCalled();
  });

  it('fails closed when Redis rate limiting is unavailable', async () => {
    redis.checkRateLimit.mockRejectedValue(new Error('redis down'));
    await expect(controller.chat(req, 'Prawn curry')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(cie.handleCoachMessage).not.toHaveBeenCalled();
  });

  it('clears server conversation state for the authenticated user', async () => {
    await expect(controller.resetChat(req)).resolves.toEqual({ cleared: true });
    expect(cie.clearConversation).toHaveBeenCalledWith('authenticated-user');
  });

  it('keeps Ingredient Creator on its validated Gemini path', async () => {
    aiService.parsePrompt.mockResolvedValue({
      text: 'Estimate',
      provenance: { source: 'gemini' },
    });
    await controller.parsePrompt(req, 'Puttu with beef');
    expect(aiService.parsePrompt).toHaveBeenCalledWith('Puttu with beef');
  });
});
