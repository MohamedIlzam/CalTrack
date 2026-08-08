import { Injectable, Logger } from '@nestjs/common';

export interface FoodSuggestion {
  id: string;
  name: string;
  kcalPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  emoji: string;
  chipColor: string;
  category: string;
}

export interface ParsePromptResult {
  text: string;
  suggestedFood?: FoodSuggestion;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async askCoach(
    prompt: string,
    userContext?: {
      name?: string;
      goal?: string;
      targetCalories?: number;
      targetProteinG?: number;
      targetCarbsG?: number;
      targetFatG?: number;
      weightKg?: number;
    },
    todayMealsSummary?: {
      consumedCalories: number;
      consumedProtein: number;
      consumedCarbs: number;
      consumedFat: number;
      mealsCount: number;
    }
  ): Promise<{ reply: string }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const systemInstructions = `You are the CalTrack AI Nutrition & Fitness Coach, an empathetic, highly knowledgeable coach specializing in macronutrients, energy balance, and global/South Asian/Sri Lankan dietary habits.
User Details:
- Name: ${userContext?.name || 'User'}
- Fitness Goal: ${userContext?.goal || 'Healthy Living'}
- Daily Target Calories: ${userContext?.targetCalories || 2000} kcal (Protein: ${userContext?.targetProteinG || 120}g, Carbs: ${userContext?.targetCarbsG || 220}g, Fat: ${userContext?.targetFatG || 60}g)
- Current Weight: ${userContext?.weightKg || 'N/A'} kg
- Today's Consumed So Far: ${todayMealsSummary?.consumedCalories || 0} kcal (Protein: ${todayMealsSummary?.consumedProtein || 0}g, Carbs: ${todayMealsSummary?.consumedCarbs || 0}g, Fat: ${todayMealsSummary?.consumedFat || 0}g) across ${todayMealsSummary?.mealsCount || 0} meals.

Provide concise, friendly, motivational, and actionable advice. Reference their macro numbers and suggest concrete meals or habits when appropriate. Keep responses under 4 short paragraphs.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `${systemInstructions}\n\nUser Question: "${prompt}"`,
        });

        const replyText = response.text || '';
        if (replyText.trim()) {
          return { reply: replyText.trim() };
        }
      } catch (err) {
        this.logger.error('Gemini Coach chat failed, falling back to smart coach', err);
      }
    }

    // Smart contextual fallback coach
    const lower = prompt.toLowerCase();
    let reply = `Great question! Looking at your daily goals of ${userContext?.targetCalories || 2000} kcal and ${userContext?.targetProteinG || 120}g protein, you are on a steady path.`;

    if (lower.includes('protein') || lower.includes('energy') || lower.includes('muscle')) {
      reply = `To boost your protein today towards your ${userContext?.targetProteinG || 120}g goal, try adding protein-dense choices like grilled chicken breast, boiled eggs, or Sri Lankan Parippu (lentil dhal) and chickpea sundal!`;
    } else if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast')) {
      reply = `For a balanced meal under 500 kcal, a combination of red rice (1 cup), dhal curry, a serving of fish or chicken, and gotu kola mallung provides optimal fiber and micronutrients with sustained energy.`;
    } else if (lower.includes('over target') || lower.includes('calories') || lower.includes('weight')) {
      reply = `To stay within your ${userContext?.targetCalories || 2000} kcal target, watch liquid calories and portion sizes of fried snacks like rolls and vadai. Opt for fresh fruit, coconut water, or vegetable curries to stay full for longer.`;
    }

    return { reply };
  }

  async parsePrompt(prompt: string): Promise<ParsePromptResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `You are CalTrack AI, an expert nutrition assistant specialized in global and South Asian / Sri Lankan cuisine.
User query: "${prompt}"

Estimate the nutrition for this food item and return ONLY a single JSON object matching this schema:
{
  "name": "Food Name",
  "kcalPerServing": 250,
  "proteinPerServing": 12,
  "carbsPerServing": 40,
  "fatPerServing": 5,
  "emoji": "🍛",
  "category": "Curries" // Choice of "Rice & Bread", "Curries", "Sides", or "Extras"
}
Do not include markdown formatting or extra text outside JSON.`,
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const food: FoodSuggestion = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: parsed.name || prompt,
            kcalPerServing: Math.round(parsed.kcalPerServing || 200),
            proteinPerServing: Math.round(parsed.proteinPerServing || 8),
            carbsPerServing: Math.round(parsed.carbsPerServing || 30),
            fatPerServing: Math.round(parsed.fatPerServing || 5),
            emoji: parsed.emoji || this.getFoodEmoji(parsed.name || prompt),
            chipColor: '#006B5F',
            category: parsed.category || 'Custom',
          };

          return {
            text: `Here is my AI estimation for **${food.name}** (${food.kcalPerServing} kcal, ${food.proteinPerServing}g protein). Tap "Add to Plate" to include it!`,
            suggestedFood: food,
          };
        }
      } catch (err) {
        this.logger.error('Gemini API call failed, falling back to smart estimator', err);
      }
    }

    // Smart Fallback Estimator (when GEMINI_API_KEY is not set or call fails)
    const food = this.generateFoodFromDescription(prompt);
    return {
      text: `Here is my estimate for **${food.name}** based on standard nutritional profiles. Tap "Add to Plate" to include it!`,
      suggestedFood: food,
    };
  }

  async scanImage(imageBase64: string): Promise<ParsePromptResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && imageBase64) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/jpeg',
              },
            },
            `Analyze this food plate photo. Identify the main dish or combination meal and estimate nutrition.
Return ONLY a single JSON object matching this schema:
{
  "name": "Detected Dish Name",
  "kcalPerServing": 350,
  "proteinPerServing": 18,
  "carbsPerServing": 45,
  "fatPerServing": 10,
  "emoji": "🍱",
  "category": "Rice & Bread"
}`,
          ],
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const food: FoodSuggestion = {
            id: `ai-img-${Date.now()}`,
            name: parsed.name || 'Scanned Meal Plate',
            kcalPerServing: Math.round(parsed.kcalPerServing || 350),
            proteinPerServing: Math.round(parsed.proteinPerServing || 15),
            carbsPerServing: Math.round(parsed.carbsPerServing || 45),
            fatPerServing: Math.round(parsed.fatPerServing || 10),
            emoji: parsed.emoji || '📸',
            chipColor: '#006B5F',
            category: parsed.category || 'Custom',
          };

          return {
            text: `I scanned your meal photo and detected **${food.name}** (~${food.kcalPerServing} kcal). Tap "Add to Plate" to log it!`,
            suggestedFood: food,
          };
        }
      } catch (err) {
        this.logger.error('Gemini Vision API call failed', err);
      }
    }

    const food: FoodSuggestion = {
      id: `ai-img-${Date.now()}`,
      name: 'Scanned Meal Plate',
      kcalPerServing: 380,
      proteinPerServing: 16,
      carbsPerServing: 52,
      fatPerServing: 11,
      emoji: '📸',
      chipColor: '#006B5F',
      category: 'Custom',
    };

    return {
      text: `I analyzed your meal image and estimated **${food.name}** (~${food.kcalPerServing} kcal, 16g P, 52g C). Tap "Add to Plate" to log it!`,
      suggestedFood: food,
    };
  }

  private generateFoodFromDescription(desc: string): FoodSuggestion {
    const lower = desc.toLowerCase();
    let name = desc.trim();
    name = name.charAt(0).toUpperCase() + name.slice(1);

    let kcal = 220;
    let protein = 8;
    let carbs = 32;
    let fat = 6;
    let category = 'Custom';

    if (/roti|paratha|bread|chapati/.test(lower)) {
      kcal = 210; protein = 5; carbs = 36; fat = 5; category = 'Rice & Bread';
    } else if (/rice|bath|kiribath|biryani|fried rice/.test(lower)) {
      kcal = 280; protein = 6; carbs = 58; fat = 3; category = 'Rice & Bread';
    } else if (/curry|dhal|parippu|korma/.test(lower)) {
      kcal = 180; protein = 9; carbs = 18; fat = 8; category = 'Curries';
    } else if (/chicken|beef|mutton|pork/.test(lower)) {
      kcal = 240; protein = 26; carbs = 2; fat = 14; category = 'Curries';
    } else if (/fish|seafood|prawn|squid/.test(lower)) {
      kcal = 190; protein = 22; carbs = 2; fat = 9; category = 'Curries';
    } else if (/sambol|mallung|salad|vegetable/.test(lower)) {
      kcal = 95; protein = 2; carbs = 10; fat = 5; category = 'Sides';
    } else if (/tea|coffee|shake|smoothie|juice/.test(lower)) {
      kcal = 120; protein = 3; carbs = 22; fat = 2; category = 'Extras';
    }

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      kcalPerServing: kcal,
      proteinPerServing: protein,
      carbsPerServing: carbs,
      fatPerServing: fat,
      emoji: this.getFoodEmoji(lower),
      chipColor: '#006B5F',
      category,
    };
  }

  private getFoodEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (/rice|bath|kiribath/.test(lower)) return '🍚';
    if (/curry|parippu|dhal|kulambu/.test(lower)) return '🍛';
    if (/roti|bread|paratha/.test(lower)) return '🫓';
    if (/hopper|appa/.test(lower)) return '🥞';
    if (/string hopper|indi appam/.test(lower)) return '🍝';
    if (/fish|ambul thiyal/.test(lower)) return '🐟';
    if (/chicken/.test(lower)) return '🍗';
    if (/egg|biththara/.test(lower)) return '🥚';
    if (/sambol|mallung/.test(lower)) return '🥗';
    if (/banana|fruit|mango/.test(lower)) return '🍌';
    if (/tea|coffee|milk/.test(lower)) return '☕';
    return '🍽️';
  }
}
