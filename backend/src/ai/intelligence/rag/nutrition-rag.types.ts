/**
 * CalTrack Intelligence Engine (CIE) — Nutrition RAG Types
 *
 * Types for the local semantic knowledge-retrieval layer.
 * Zero PII or external LLM dependencies.
 */

export interface NutritionKnowledgeItem {
  topic: 'protein' | 'calories' | 'macronutrients' | 'balanced_diet' | 'hydration' | 'meal_planning';
  title: string;
  content: string;
  sourceTitle: string;
  sourceUrl: string;
  provenance: string;
}

export interface NutritionKnowledgeResult {
  id: string;
  topic: string;
  title: string;
  content: string;
  sourceTitle: string;
  sourceUrl: string;
  provenance: string;
  distance: number;
  similarity: number;
}

export interface IngestionResult {
  totalProcessed: number;
  inserted: number;
  skippedDuplicates: number;
}

export interface RagSearchOptions {
  limit?: number;
  topic?: string;
  maxDistanceThreshold?: number;
}
