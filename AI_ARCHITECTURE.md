# CalTrack AI architecture

CalTrack uses a privacy-preserving hybrid design.

## Personal questions

Authenticated diary, target, weight, history, pattern, and recommendation requests are resolved by validated local intent plans and read-only server tools. Exact arithmetic and final composition remain local. Gemini does not receive tool results or personal records and must not be described as having analyzed those records.

The backend stores only compact conversation state (`lastSubject`, `lastDate`, `lastIntent`, and a nonpersonal food name) in Redis with a five-minute TTL and an in-process fallback. This supports bounded follow-ups such as “How much more do I need?” without sending prior personal turns to Gemini.

## General nutrition and foods

Named-food questions first use the CalTrack food catalog. Educational questions can retrieve curated nutrition passages through local MiniLM embeddings and pgvector; when evidence exists, Gemini receives only the nonpersonal question and retrieved reference text. Returned citations identify the actual source records.

Generic conversation and Ingredient Creator estimates may use Gemini. Ingredient estimates are labelled approximate, include an explicit serving and assumptions, and are checked for broad range and macronutrient-energy consistency before display.

## Privacy and provenance

Sensitive prompts are rejected before CIE or legacy Gemini fallbacks. Provenance distinguishes the final response author from factual sources where available. Existing persisted messages remain compatible because the new metadata fields are optional.

## Deliberate V1 limits

- No automated multi-week or 30-day meal-plan generation. A 30-day historical nutrition summary is supported.
- No medical diagnosis or treatment advice.
- No claim that model estimates are verified catalog nutrition.
- Conversation state is bounded, not a full transcript supplied to Gemini.
- RAG depends on the curated `NutritionKnowledge` table and degrades safely when retrieval or generation is unavailable.
- Image-recognition development remains outside this upgrade.
