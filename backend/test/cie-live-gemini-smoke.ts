/**
 * Developer-only live Gemini smoke evaluation.
 * Uses nonpersonal prompts and hardcoded synthetic tool results only.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { GeminiFunctionCallingService } from '../src/ai/intelligence/gemini-function-calling.service';

const syntheticDispatcher: any = {
  isToolAllowed: (name: string) =>
    ['lookupFoods', 'searchNutritionKnowledge', 'getNutritionTargets'].includes(
      name,
    ),
  dispatchBatch: async (_authenticatedSyntheticUser: string, calls: any[]) =>
    calls.map((call) => {
      if (call.name === 'lookupFoods') {
        return {
          tool: call.name,
          callId: call.callId,
          success: true,
          data: {
            query: call.args?.query,
            foods: call.args?.query?.toLowerCase().includes('prawn')
              ? [
                  {
                    name: 'Prawn curry',
                    servingDescription: '1 cup',
                    servingGrams: 240,
                    calories: 310,
                    protein: 24,
                    carbs: 12,
                    fat: 18,
                    isVerified: true,
                  },
                ]
              : [],
          },
        };
      }
      if (call.name === 'searchNutritionKnowledge') {
        return {
          tool: call.name,
          callId: call.callId,
          success: true,
          data: {
            query: call.args?.query,
            evidence: [
              {
                title: 'Synthetic protein recovery passage',
                content:
                  'Dietary protein supplies amino acids used during muscle repair.',
                sourceTitle: 'Synthetic Test Reference',
                sourceUrl: 'https://example.org/synthetic-reference',
                provenance: 'synthetic-live-smoke',
              },
            ],
          },
        };
      }
      return {
        tool: call.name,
        callId: call.callId,
        success: true,
        data: {
          targetCalories: 2100,
          targetProteinG: 133,
          targetCarbsG: 250,
          targetFatG: 70,
          goal: 'MAINTAIN',
        },
      };
    }),
};

async function main() {
  if (!process.env.GEMINI_API_KEY)
    throw new Error('GEMINI_API_KEY is not configured');
  const service = new GeminiFunctionCallingService(syntheticDispatcher);
  const cases = [
    { prompt: 'Chicken and rice', privacyMode: 'generic' as const },
    {
      prompt: 'What does protein do for muscle recovery?',
      privacyMode: 'generic' as const,
    },
    {
      prompt: 'How much protein should I take?',
      privacyMode: 'personalized' as const,
    },
  ];
  for (const item of cases) {
    const result = await service.generateCoachResponse({
      authenticatedUserId: 'synthetic-live-user',
      prompt: item.prompt,
      currentDate: '2026-11-22',
      timeZone: 'Asia/Colombo',
      privacyMode: item.privacyMode,
      history: [],
    });
    console.log(
      JSON.stringify({
        prompt: item.prompt,
        reply: result.reply,
        tools: result.toolResults.map((tool) => tool.tool),
        factualSources: result.factualSources,
        citations: result.citations,
        model: result.modelUsed,
      }),
    );
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
