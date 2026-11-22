import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  CieCoachService,
  PERSONALIZED_GEMINI_CONSENT_VERSION,
} from './cie-coach.service';

describe('CieCoachService Gemini-only privacy orchestration', () => {
  const originalEnv = { ...process.env };
  let cache: Map<string, string>;
  let redis: any;
  let gemini: any;
  let service: CieCoachService;

  const generated = (reply = 'Gemini generated answer') => ({
    reply,
    modelUsed: 'controlled-gemini',
    toolResults: [],
    suppliedToolPayloads: [],
    factRefs: [],
    factualSources: ['gemini_estimate'],
    citations: [],
    claimsValidated: true,
  });

  beforeEach(() => {
    cache = new Map();
    redis = {
      get: jest.fn(async (key: string) => cache.get(key) || null),
      set: jest.fn(
        async (key: string, value: string) => void cache.set(key, value),
      ),
      del: jest.fn(async (key: string) => void cache.delete(key)),
    };
    gemini = {
      generateCoachResponse: jest.fn().mockResolvedValue(generated()),
    };
    service = new CieCoachService(gemini, redis);
    delete process.env.GEMINI_PERSONALIZED_DATA_ENABLED;
    delete process.env.GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses generic Gemini mode without sharing personal context', async () => {
    const result = await service.handleCoachMessage(
      'user-a',
      'How to cook potato?',
      '2026-11-22',
      'Asia/Colombo',
    );
    expect(result.reply).toBe('Gemini generated answer');
    expect(result.provenance.responseAuthor).toBe('gemini');
    expect(result.provenance.personalDataMode).toBe('not_requested');
    expect(gemini.generateCoachResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatedUserId: 'user-a',
        privacyMode: 'generic',
        history: [],
      }),
    );
  });

  it('P. blocks personalized mode when operator configuration is disabled', async () => {
    await expect(
      service.handleCoachMessage(
        'user-a',
        'How much protein have I consumed today?',
        '2026-11-22',
        'Asia/Colombo',
        {
          personalizedConsent: true,
          consentVersion: PERSONALIZED_GEMINI_CONSENT_VERSION,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(gemini.generateCoachResponse).not.toHaveBeenCalled();
  });

  it('Q. enables personalized mode only with operator confirmation and versioned consent', async () => {
    process.env.GEMINI_PERSONALIZED_DATA_ENABLED = 'true';
    process.env.GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION =
      'PAID_DATA_TERMS_CONFIRMED';
    gemini.generateCoachResponse.mockResolvedValue({
      ...generated('You consumed 7g protein.'),
      factualSources: ['user_records'],
    });
    const result = await service.handleCoachMessage(
      'user-a',
      'How much protein have I consumed today?',
      '2026-11-22',
      'Asia/Colombo',
      {
        personalizedConsent: true,
        consentVersion: PERSONALIZED_GEMINI_CONSENT_VERSION,
      },
    );
    expect(gemini.generateCoachResponse).toHaveBeenCalledWith(
      expect.objectContaining({ privacyMode: 'personalized' }),
    );
    expect(result.provenance.source).toBe('hybrid');
    expect(result.provenance.personalDataMode).toBe('permitted');
    expect(result.provenance.responseAuthor).toBe('gemini');
  });

  it('requires the exact consent version even when the operator is configured', async () => {
    process.env.GEMINI_PERSONALIZED_DATA_ENABLED = 'true';
    process.env.GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION =
      'PAID_DATA_TERMS_CONFIRMED';
    await expect(
      service.handleCoachMessage(
        'user-a',
        'Tell me about myself.',
        undefined,
        undefined,
        {
          personalizedConsent: true,
          consentVersion: 'old-version',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects sensitive user text before any Gemini request', async () => {
    await expect(
      service.handleCoachMessage(
        'user-a',
        'My password: hunter2; how many calories?',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gemini.generateCoachResponse).not.toHaveBeenCalled();
  });

  it('R. isolates bounded conversation history by authenticated account', async () => {
    await service.handleCoachMessage('user-a', 'Prawn curry');
    gemini.generateCoachResponse.mockClear();
    await service.handleCoachMessage('user-b', 'Chicken and rice');
    expect(gemini.generateCoachResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatedUserId: 'user-b',
        history: [],
      }),
    );
    expect([...cache.keys()]).toEqual(
      expect.arrayContaining([
        'cie:gemini-context:user-a',
        'cie:gemini-context:user-b',
      ]),
    );
  });

  it('passes bounded prior Gemini conversation to resolve generic references', async () => {
    gemini.generateCoachResponse
      .mockResolvedValueOnce(generated('That meal is an estimate.'))
      .mockResolvedValueOnce(generated('It is approximately 500 kcal.'));
    await service.handleCoachMessage('user-a', 'Chicken with beef calories');
    await service.handleCoachMessage('user-a', 'How many calories is it?');
    expect(gemini.generateCoachResponse.mock.calls[1][0].history).toEqual([
      { role: 'user', text: 'Chicken with beef calories' },
      { role: 'model', text: 'That meal is an estimate.' },
    ]);
  });

  it('U. rejects a stale referential follow-up after context expiry', async () => {
    cache.set(
      'cie:gemini-context:user-a',
      JSON.stringify({
        messages: [{ role: 'user', text: 'Prawn curry', mode: 'generic' }],
        updatedAt: Date.now() - 700_000,
      }),
    );
    await expect(
      service.handleCoachMessage('user-a', 'How many calories is it?'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gemini.generateCoachResponse).not.toHaveBeenCalled();
  });

  it('clears both Redis and in-process context on reset', async () => {
    await service.handleCoachMessage('user-a', 'Prawn curry');
    await service.clearConversation('user-a');
    expect(redis.del).toHaveBeenCalledWith('cie:gemini-context:user-a');
    gemini.generateCoachResponse.mockClear();
    await expect(
      service.handleCoachMessage('user-a', 'How many calories is it?'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
