import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

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
  isEstimate?: boolean;
}

export interface ParsePromptResult {
  text: string;
  suggestedFood?: FoodSuggestion;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  public get modelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

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
    },
  ): Promise<{ reply: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured in environment');
      throw new ServiceUnavailableException('AI Coach is not configured.');
    }

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

Provide concise, friendly, motivational, and actionable advice. Reference their macro numbers and suggest concrete meals or habits when appropriate. Keep responses under 3 short paragraphs.
Important: Always maintain that your advice is educational and not medical therapy.`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: `${systemInstructions}\n\nUser Question: "${prompt}"`,
        config: {
          maxOutputTokens: 600,
          temperature: 0.7,
        },
      });

      const replyText = response.text?.trim() || '';
      if (!replyText) {
        throw new Error('Received empty response from Gemini');
      }

      return { reply: replyText };
    } catch (err: any) {
      this.logger.error(`Gemini Coach chat failed on model ${this.modelName}: ${err.message || err}`);
      throw new ServiceUnavailableException(
        'AI Coach is temporarily unavailable. Please try again shortly.',
      );
    }
  }

  async parsePrompt(prompt: string): Promise<ParsePromptResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured in environment');
      throw new ServiceUnavailableException('AI Food Parser is not configured.');
    }

    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: `You are CalTrack AI, an expert nutrition assistant specialized in global and South Asian / Sri Lankan cuisine.
Estimate the nutrition per typical single serving for this food item: "${prompt}".
Categorize into exactly one of: "Rice & Bread", "Curries", "Sides", "Extras", or "Custom".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Canonical food or dish name' },
              kcalPerServing: { type: Type.NUMBER, description: 'Estimated calories in kcal per typical serving' },
              proteinPerServing: { type: Type.NUMBER, description: 'Estimated protein in grams' },
              carbsPerServing: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams' },
              fatPerServing: { type: Type.NUMBER, description: 'Estimated fat in grams' },
              emoji: { type: Type.STRING, description: 'Single food emoji' },
              category: { type: Type.STRING, description: 'One of Rice & Bread, Curries, Sides, Extras, or Custom' },
            },
            required: ['name', 'kcalPerServing', 'proteinPerServing', 'carbsPerServing', 'fatPerServing'],
          },
          maxOutputTokens: 250,
          temperature: 0.2,
        },
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText);

      const kcal = Number(parsed.kcalPerServing);
      const protein = Number(parsed.proteinPerServing);
      const carbs = Number(parsed.carbsPerServing);
      const fat = Number(parsed.fatPerServing);

      // Strict runtime range validation
      if (
        isNaN(kcal) || kcal < 0 || kcal > 5000 ||
        isNaN(protein) || protein < 0 || protein > 500 ||
        isNaN(carbs) || carbs < 0 || carbs > 500 ||
        isNaN(fat) || fat < 0 || fat > 500
      ) {
        this.logger.warn(`Model produced out-of-bounds nutrient values: ${JSON.stringify(parsed)}`);
        throw new Error('Estimated nutrient values out of acceptable bounds');
      }

      const validCategories = ['Rice & Bread', 'Curries', 'Sides', 'Extras'];
      const category = validCategories.includes(parsed.category) ? parsed.category : 'Custom';

      const food: FoodSuggestion = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: (parsed.name || prompt).trim(),
        kcalPerServing: Math.round(kcal),
        proteinPerServing: Math.round(protein * 10) / 10,
        carbsPerServing: Math.round(carbs * 10) / 10,
        fatPerServing: Math.round(fat * 10) / 10,
        emoji: parsed.emoji && parsed.emoji.length <= 4 ? parsed.emoji : this.getFoodEmoji(parsed.name || prompt),
        chipColor: '#006B5F',
        category,
        isEstimate: true,
      };

      return {
        text: `AI Nutritional Estimate (approximate): **${food.name}** (~${food.kcalPerServing} kcal, ${food.proteinPerServing}g P, ${food.carbsPerServing}g C, ${food.fatPerServing}g F). Tap "Add to Plate" to include it!`,
        suggestedFood: food,
      };
    } catch (err: any) {
      this.logger.error(`Gemini prompt parsing failed on model ${this.modelName}: ${err.message || err}`);
      throw new ServiceUnavailableException(
        'AI food analysis is temporarily unavailable. Please enter food manually or try again.',
      );
    }
  }

  async scanImage(imageBase64: string): Promise<ParsePromptResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured in environment');
      throw new ServiceUnavailableException('AI Vision is not configured.');
    }

    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      let mimeType = 'image/jpeg';
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          `Analyze this meal photo. Identify the primary dish or composite meal and estimate nutrition per single serving.
Categorize into exactly one of: "Rice & Bread", "Curries", "Sides", "Extras", or "Custom".`,
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Detected dish or meal name' },
              kcalPerServing: { type: Type.NUMBER, description: 'Estimated calories in kcal' },
              proteinPerServing: { type: Type.NUMBER, description: 'Estimated protein in grams' },
              carbsPerServing: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams' },
              fatPerServing: { type: Type.NUMBER, description: 'Estimated fat in grams' },
              emoji: { type: Type.STRING, description: 'Single food emoji' },
              category: { type: Type.STRING, description: 'One of Rice & Bread, Curries, Sides, Extras, or Custom' },
            },
            required: ['name', 'kcalPerServing', 'proteinPerServing', 'carbsPerServing', 'fatPerServing'],
          },
          maxOutputTokens: 300,
          temperature: 0.2,
        },
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText);

      const kcal = Number(parsed.kcalPerServing);
      const protein = Number(parsed.proteinPerServing);
      const carbs = Number(parsed.carbsPerServing);
      const fat = Number(parsed.fatPerServing);

      if (
        isNaN(kcal) || kcal < 0 || kcal > 5000 ||
        isNaN(protein) || protein < 0 || protein > 500 ||
        isNaN(carbs) || carbs < 0 || carbs > 500 ||
        isNaN(fat) || fat < 0 || fat > 500
      ) {
        this.logger.warn(`Model produced out-of-bounds vision nutrient values: ${JSON.stringify(parsed)}`);
        throw new Error('Estimated vision nutrient values out of acceptable bounds');
      }

      const validCategories = ['Rice & Bread', 'Curries', 'Sides', 'Extras'];
      const category = validCategories.includes(parsed.category) ? parsed.category : 'Custom';

      const food: FoodSuggestion = {
        id: `ai-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: (parsed.name || 'Scanned Meal Plate').trim(),
        kcalPerServing: Math.round(kcal),
        proteinPerServing: Math.round(protein * 10) / 10,
        carbsPerServing: Math.round(carbs * 10) / 10,
        fatPerServing: Math.round(fat * 10) / 10,
        emoji: parsed.emoji && parsed.emoji.length <= 4 ? parsed.emoji : '📸',
        chipColor: '#006B5F',
        category,
        isEstimate: true,
      };

      return {
        text: `AI Photo Scan Estimate (approximate): Detected **${food.name}** (~${food.kcalPerServing} kcal, ${food.proteinPerServing}g P, ${food.carbsPerServing}g C, ${food.fatPerServing}g F). Tap "Add to Plate" to include it!`,
        suggestedFood: food,
      };
    } catch (err: any) {
      this.logger.error(`Gemini Vision scan failed on model ${this.modelName}: ${err.message || err}`);
      throw new ServiceUnavailableException(
        'AI photo analysis is temporarily unavailable. Please try another photo or enter food manually.',
      );
    }
  }

  // Deterministic local emoji mapping utility (preserved for consistency)
  public getFoodEmoji(name: string): string {
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

  // Deterministic rule-based estimator (available for explicit offline approximation only)
  public generateFoodFromDescription(desc: string): FoodSuggestion {
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
      isEstimate: true,
    };
  }
}
