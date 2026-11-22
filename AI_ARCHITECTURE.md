# CalTrack Gemini Coach architecture

## Response pipeline

Every successful `POST /ai/chat` response is authored by Gemini:

1. The authenticated request is rate-limited and checked for sensitive content.
2. The server selects generic or personalized privacy mode.
3. Gemini receives bounded conversation history and the read-only tools permitted for that mode.
4. Gemini may request up to three tools. CalTrack validates arguments and executes them under the authenticated server-side user ID.
5. Tool results are minimized and returned to Gemini as actual `functionResponse` parts.
6. Gemini returns the final natural-language reply plus structured fact and citation references.
7. CalTrack validates referenced facts, nutrition numbers, dates, and citation IDs. A contradictory answer receives one bounded model correction attempt and is otherwise rejected.

CalTrack never turns tool results into a conversational reply with TypeScript templates. If Gemini is unavailable or its answer cannot be verified, the API returns an explicit error and the frontend renders it outside the conversation.

## Privacy modes

### Generic mode

Generic mode is available without personal-record sharing. Gemini can discuss foods, composite meals, preparation, recipes, general estimates, and educational nutrition. It can query only the public CalTrack food catalog and local nutrition-knowledge retrieval. Generic history excludes personalized turns.

### Personalized mode

Personalized mode is default-disabled and requires both gates on every request:

- Operator configuration:
  - `GEMINI_PERSONALIZED_DATA_ENABLED=true`
  - `GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION=PAID_DATA_TERMS_CONFIRMED`
- Informed user opt-in using consent version `2026-11-22`.

The operator variables must be set only after confirming an eligible paid Gemini API configuration and applicable data-processing terms. An API key or billing guess never enables the mode.

When permitted, the backend sends only tool-specific structured fields needed for the current question. It strips account IDs and never sends names, emails, credentials, authentication tokens, password data, or an unrestricted raw history. Daily item names are included only for questions that actually require meal-level explanation.

If either gate is missing, personal questions return `PERSONALIZED_GEMINI_REQUIRED`; CalTrack does not fabricate a local Coach answer.

## Conversation state

Conversation history is stored per authenticated user under a user-specific Redis key with a ten-minute TTL and a bounded in-process availability fallback. At most eight messages are retained, and at most six are supplied to a model turn. Reset removes server and frontend context. Expired referential questions are rejected with `CONVERSATION_CONTEXT_EXPIRED` instead of guessing.

## Grounding and provenance

- Personal facts: authenticated read-only PostgreSQL tools.
- Food facts: stored CalTrack catalog rows when available.
- Educational evidence: local MiniLM embeddings plus pgvector retrieval.
- Missing catalog food: a clearly labelled Gemini estimate with a serving assumption.

RAG passages are treated as untrusted reference data. Citation IDs are generated from actual retrieved rows, and only cited retrieved sources appear in API provenance. Provenance records Gemini as the response author separately from `user_records`, `caltrack_database`, `rag_evidence`, or `gemini_estimate` factual sources.

## Deliberate restrictions

- No personal records are sent under an unpaid/unconfirmed Gemini configuration.
- No local conversational fallback impersonates Gemini.
- No image-recognition expansion or automated multi-week meal-plan system was added.
- Ingredient Creator remains a separate structured-estimate path with serving and macronutrient-energy validation.
- This design is not a medical-diagnosis system.
