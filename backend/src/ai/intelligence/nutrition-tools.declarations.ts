/**
 * CalTrack Intelligence Engine (CIE) — Gemini Function Declarations
 *
 * Defines strictly typed schemas for Gemini function calling using the installed @google/genai SDK.
 * Descriptions guide the model to select tools for natural-language nutrition, goal, and history queries.
 */

import { Type } from '@google/genai';

export const NUTRITION_TOOL_DECLARATIONS = [
  {
    name: 'getDailyNutrition',
    description:
      'Retrieves the user\'s logged meals, food item names, serving sizes, and total calories and macronutrients (protein, carbs, fat in grams) for a specific calendar date. Call this whenever the user asks what they ate, how many calories or macros they consumed, or what was logged on a given date (including today or yesterday).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
          description:
            'The target calendar date in ISO YYYY-MM-DD format (e.g. "2026-11-20"). When the user asks about today, yesterday, or a specific day of the week, provide the exact YYYY-MM-DD calendar date.',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'getNutritionTargets',
    description:
      'Retrieves the user\'s authoritative daily calorie goal, macronutrient targets (protein, carbohydrates, fat in grams), current fitness goal (e.g. LOSE, MAINTAIN, GAIN), body weight, and height. Call this whenever the user asks about their calorie budget, macro goals, remaining calories needed, or fitness target.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getFoodHistory',
    description:
      'Retrieves multi-day historical food logs, daily totals, distinct food names eaten, and daily averages over a recent period (between 1 and 7 days). Call this when the user asks about their weekly intake, eating consistency, or recent multi-day meal trends.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: {
          type: Type.INTEGER,
          description:
            'The number of days to inspect historically (must be an integer between 1 and 7).',
        },
        endDate: {
          type: Type.STRING,
          description:
            'Optional reference end date in YYYY-MM-DD format. Defaults to today if omitted.',
        },
      },
      required: ['days'],
    },
  },
];
