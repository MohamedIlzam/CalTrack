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
      'Retrieves bounded historical food logs, daily totals, food names, logging consistency, and averages for 1 to 30 days. Use 7 for weekly and 30 for monthly personal summaries.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: {
          type: Type.INTEGER,
          description:
            'The number of days to inspect historically (must be an integer between 1 and 30).',
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
  {
    name: 'lookupFoods',
    description: 'Looks up factual serving nutrition from the CalTrack food catalog for named foods or dishes. Use for general food macro comparisons and food facts; it does not access diary records.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Concise food or dish name, without conversational filler.' },
        limit: { type: Type.INTEGER, description: 'Maximum results from 1 to 8.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getWeightProgress',
    description: 'Retrieves the authenticated user weight trend over a bounded number of days.',
    parameters: {
      type: Type.OBJECT,
      properties: { days: { type: Type.INTEGER, description: 'Window from 1 to 365 days.' } },
    },
  },
  {
    name: 'getMealPatterns',
    description: 'Retrieves the authenticated user commonly logged foods and meal-slot frequencies for up to 30 days.',
    parameters: {
      type: Type.OBJECT,
      properties: { days: { type: Type.INTEGER, description: 'Window from 1 to 30 days.' } },
    },
  },
  {
    name: 'getFoodRecommendations',
    description: 'Returns bounded Sri Lankan food suggestions from actual CalTrack catalog rows, optionally constrained by a calorie budget and protein priority.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        maxCalories: { type: Type.NUMBER, description: 'Maximum calories for one catalog serving.' },
        proteinPriority: { type: Type.BOOLEAN, description: 'Prefer foods with higher protein density.' },
        limit: { type: Type.INTEGER, description: 'Maximum suggestions from 1 to 6.' },
      },
    },
  },
];
