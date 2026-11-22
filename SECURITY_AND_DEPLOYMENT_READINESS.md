# CalTrack Security and Deployment Readiness

Audit date: 2026-11-22
Scope: first staging deployment to Vercel, Render, Neon, Upstash, and Gemini. No deployment or real-user data mutation was performed.

## A. Exact repository status

- Audit-start branch: `codex/gemini-generated-coach`
- Audit-start HEAD: `b1c89e54da1978dc537a7ad03bc67eecf1b453df`
- Audit-start status: clean and synchronized with `origin/codex/gemini-generated-coach`
- Final branch: `codex/gemini-generated-coach`
- Final HEAD: the commit containing this report; the exact immutable SHA is recorded in the final Codex handoff.
- Only the original checkout was used. No clone, worktree, install, database reset, deployment, or secret modification occurred.
- Changed areas: CI workflow, ignore rules, backend environment example, Render blueprint, Prisma baseline/config/seeds, database and Redis connection security, authentication/JWT controls, API validation/health behavior, targeted tests, Next.js security headers, and this report.

## B. Previously verified evidence reused

- Gemini Coach commit `b1c89e5`: backend build, 21 suites/221 tests, frontend TypeScript/tests, and three synthetic live Gemini requests.
- Preceding AI upgrade: authenticated PostgreSQL/Redis integration and synthetic account isolation.
- Existing tests retained and inspected for authenticated controller guards, edit authorization, generic/personalized AI privacy, operator and consent gates, identity-argument stripping, RAG prompt injection, context expiry, and bounded tool execution.
- The complete suites and live Gemini tests were not repeated because this audit did not redesign AI behavior and did not change frontend application behavior. Only affected tests were rerun.

## C. Newly audited areas

### Authentication and sessions

- Passwords use bcrypt with cost 10 and are never selected into JWT validation output or returned by registration, login, or profile APIs.
- Registration now accepts only normalized valid email, 1-100 character name, 10-128 character password, valid enums, and bounded profile/target values.
- Login accepts legacy passwords but bounds bcrypt input at 128 characters.
- Login and registration now use fail-closed Redis limits. Email identities are SHA-256 hashed before becoming Redis keys.
- JWTs are fixed to HS256, expire after seven days, and require a real database user. Targeted checks reject expired, forged, and malformed tokens.
- Protected operations derive user identity from the verified token. Client-supplied AI tool `userId` values are stripped.
- Browser tokens remain in `localStorage`. This is an XSS theft risk; CSP and safe React text rendering reduce it, but logout cannot revoke an already-issued token. Moving to revocable HttpOnly cookies is deferred because it would intentionally break the existing session contract.

### Secrets

- Targeted scans of tracked content, filenames, all branch history, frontend assets, workflow/config files, and common credential/private-key patterns found no real committed cloud secret.
- `backend/.env` exists locally but is ignored and was never printed or modified.
- Only `NEXT_PUBLIC_API_URL` reaches the frontend. Gemini, PostgreSQL, Redis, and JWT values remain backend-only.
- Example/CI credentials are explicit local placeholders, not production credentials.

### Authorization and API boundaries

- Profile, food, meal, progress, and AI controllers are JWT protected.
- Profile, diary reads, weight history, AI context, and tool queries scope by authenticated user ID.
- Meal edit and delete verify entry ownership. A missing cross-account delete regression was added.
- Date, quantity, nutrition, weight, history-window, food-query, profile, and authentication input bounds were added or confirmed.
- AI endpoints remain limited to 15 requests/minute/account and fail closed if Redis is unavailable.
- `/ai/scan-image` remains authenticated, rate-limited, MIME-limited, and capped at approximately 5 MB decoded input. Recognition quality remains V2 scope.
- Backend responses now include basic no-sniff, anti-framing, referrer, permissions, and no-store headers. Compressed request bodies are rejected before parsing.
- The Vercel frontend now emits CSP and browser security headers. The CSP restricts network access to the configured API origin; static Next.js output requires the documented inline allowances.

### Gemini privacy

- Generic mode has no private tools. Personalized mode still requires the server feature flag, exact operator confirmation, and versioned user consent.
- Personalized mode remains disabled in `render.yaml`.
- Consent revocation changes subsequent requests back to generic mode; generic history excludes personalized turns.
- Tools always receive the authenticated server identity, not model/client identity.
- Prompts and personal tool payloads are not written to application logs.
- Gemini latency/high-demand failures remain unresolved and intentionally deferred.

### Dependency audit

`npm audit --omit=dev --json` on 2026-11-22 reported:

- Backend: 1 critical, 15 high, 4 moderate.
- Frontend: 1 high.

Reachability review:

- `proxy-addr` critical: CalTrack explicitly disables Express proxy trust and does not use proxy-derived IP authorization.
- `body-parser` high: limits are valid and compressed request bodies are now rejected, addressing the reported reachable DoS conditions.
- `multer` high: CalTrack has no multipart upload route.
- `hono`, Prisma CLI/MySQL, transformer protobuf/sharp, and frontend source-map advisories are transitive paths not exposed to untrusted application routing in the inspected code.

No package was upgraded because installs were prohibited and disk space was critically low. The advisory count remains real even where current reachability is mitigated. Refresh the lockfiles in a dependency-capable branch and rerun CI before public production.

## D. Confirmed findings and fixes

### HIGH - committed migrations did not describe the application schema

- Location: `backend/prisma/migrations`
- Evidence: the old initial migration created obsolete `FoodItem`/meal columns, omitted current catalog/profile/weight/moderation tables, and did not create pgvector before vector columns.
- Risk: a fresh Neon database could not run the application.
- Fix: replaced the unreleased migration history with one first-deployment baseline generated from the current schema, including `CREATE EXTENSION vector`.
- Verification: Prisma schema validation passed; baseline and Prisma-generated SQL both contain 37 statements and all statements after the wrapper schema statement match exactly.
- Remaining action: execute `prisma migrate deploy` against a fresh staging Neon branch. No safe disposable database was available locally.

### HIGH - Neon runtime connection discarded TLS/pooling URL parameters

- Location: `backend/src/prisma/prisma.service.ts`, Prisma config, environment examples
- Evidence: the adapter decomposed the URL into host/user fields and discarded query parameters such as `sslmode=require`.
- Risk: failed or insecure Neon connectivity and excessive connections.
- Fix: pass the complete connection string to a bounded `pg` pool; require TLS in production; use pooled `DATABASE_URL` at runtime and direct `DIRECT_DATABASE_URL` for migrations/seeds.
- Verification: backend build and database configuration tests passed.

### HIGH - public authentication lacked abuse controls and bounded validation

- Location: `backend/src/auth`
- Evidence: login/registration accepted `any`, allowed weak registration passwords, and had no rate limiter.
- Risk: credential stuffing, account-registration abuse, and avoidable bcrypt/validation resource use.
- Fix: bounded validation, normalized email, hashed rate-limit identities, per-identity and global Redis limits, fail-closed behavior, and fixed JWT algorithm.
- Verification: password hashing/non-disclosure, validation, rate limiting, Redis failure, and JWT rejection tests passed.

### MEDIUM - resource and deployment health bounds were incomplete

- Locations: meal, progress, food, main bootstrap, health service
- Risk: authenticated resource exhaustion, malformed stored nutrition values, and Render accepting an unhealthy database instance.
- Fix: bounded inputs/windows, calendar validation, request/parser limits, compressed-body rejection, and HTTP 503 on database health failure.
- Verification: build plus focused meal/progress/app tests passed.

### MEDIUM - browser security headers were absent

- Location: `frontend/next.config.ts`
- Risk: weaker containment if an XSS or framing defect is introduced while JWTs remain in local storage.
- Fix: CSP, no-sniff, anti-framing, referrer, and permissions policies.
- Verification: frontend TypeScript and seven header assertions passed. A production Next build was skipped for disk safety.

## E. Deployment readiness

- Fresh Prisma migration: statically matched and validated; live fresh-database execution is **not yet verified**.
- pgvector: created by the baseline before vector tables; Neon supports pgvector.
- Food seed: idempotent by catalog identity and now repairs a missing embedding after an interrupted run.
- RAG seed: idempotent by `contentHash`.
- Render: root/build/start/health/env configuration is aligned. Start applies migrations; first-deploy hook seeds catalog and RAG. Node 22 is pinned.
- Vercel: root is `frontend`; Next.js 16 build command is `npm run build`; only the public API origin is configured.
- Neon: pooled runtime and direct migration URLs are separated and TLS is required.
- Upstash: `rediss://` is required in production; rate-limit and conversation keys are account-scoped with TTLs.
- Gemini: key is server-side and personalized processing defaults off.
- Infrastructure risk: Render Free is 0.1 CPU/512 MB and is not recommended for production. CalTrack loads a shared MiniLM ONNX model at startup; memory behavior on 512 MB has not been proven. Use staging to measure RSS and cold-start time, with a paid 2 GB instance as the likely fallback. See [Render plan specifications](https://render.com/docs/blueprint-spec) and [free-tier limitations](https://render.com/docs/free).

## F. Exact deployment runbook

### 1. Neon PostgreSQL

1. Create a PostgreSQL 16 project/branch in the same region chosen for Render.
2. Obtain both connection strings with `sslmode=require`:
   - pooled host (`-pooler`) -> `DATABASE_URL`
   - direct host -> `DIRECT_DATABASE_URL`
3. Ensure the application role can create the `vector` extension and schema objects.
4. From a trusted deployment environment using the direct URL, run:

   ```powershell
   cd backend
   $env:DIRECT_DATABASE_URL='<direct Neon URL>'
   npx prisma migrate deploy
   npx prisma migrate status
   npm run seed:all
   ```

5. Confirm `vector`, `_prisma_migrations`, catalog tables, and `NutritionKnowledge` exist. Do not run `migrate reset` or `db push` in production. Prisma recommends a direct connection for migrations and pooled runtime traffic ([Prisma PostgreSQL guidance](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql)).

### 2. Upstash Redis

1. Create Redis in the same/nearest region.
2. Copy the TLS connection URL to Render as `REDIS_URL`; it must begin `rediss://`.
3. Do not expose Redis credentials to Vercel or any `NEXT_PUBLIC_` variable. Upstash states TLS is always enabled ([Upstash security](https://upstash.com/docs/redis/features/security)).

### 3. Render backend

1. Merge the audited branch through CI, then create a Blueprint from repository `render.yaml`.
2. Keep root directory `backend`, Node `22.22.0`, build `npm ci && npx prisma generate && npm run build`, start `npm run start:render`, and health path `/health`.
3. Configure these Render variables:
   - `NODE_ENV`
   - `NODE_VERSION`
   - `PORT`
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional)
   - `GEMINI_FALLBACK_MODEL` (optional)
   - `GEMINI_PERSONALIZED_DATA_ENABLED=false`
   - `GEMINI_PERSONALIZED_OPERATOR_CONFIRMATION` left unset
   - `FRONTEND_URL` set to the exact HTTPS Vercel origin
4. Use a unique 32+ character JWT secret. Never reuse database, Redis, or Gemini credentials.
5. Verify the first-deploy seed hook completes. Render free instances do not support pre-deploy commands, so migrations run idempotently in the start command; paid services should move `npx prisma migrate deploy` to `preDeployCommand` ([Render deploy lifecycle](https://render.com/docs/deploys)).
6. Verify `https://<service>.onrender.com/health` returns HTTP 200 with database and Redis `ok`.

### 4. Vercel frontend

1. Import the repository and set Root Directory to `frontend`.
2. Select Next.js, Node 22, install `npm ci`, and build `npm run build`.
3. Configure only `NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com` for Preview and Production.
4. Do not configure backend secrets in Vercel. Vercel applies environment changes only to new deployments ([Vercel environment variables](https://vercel.com/docs/environment-variables)).
5. Update Render `FRONTEND_URL` to the final exact Vercel production origin and redeploy the backend.

### 5. Staging smoke tests

1. Confirm `/health` is 200 and reports database/Redis `ok`.
2. Register two synthetic accounts; verify weak registration passwords and repeated login attempts are rejected.
3. For both accounts, create/read/edit/delete synthetic meals and weights; verify cross-account entry IDs return 403 and remain unchanged.
4. Verify food search returns seeded data and RAG returns seeded evidence.
5. Verify generic Coach prompts work without personal data. Confirm personalized prompts remain blocked.
6. Verify Gemini/Redis failures do not break registration, diary, search, or progress except where auth/AI rate limiting intentionally fails closed.
7. Inspect response headers and browser CSP console, then measure backend peak RSS during startup, food search, RAG, and one AI request.

## G. Outstanding blockers

### Must fix before public production

- Refresh vulnerable dependency lockfiles and reduce the remaining audit findings; rerun production-only audits and CI.
- Complete a clean Vercel production build.
- Establish a token-revocation/rotation policy. HttpOnly cookies are recommended for a later compatible session migration.

### Must verify during staging

- Execute the baseline migration and both seeds against a fresh Neon branch.
- Confirm Neon role permissions, direct/pooler URLs, TLS, and connection limits.
- Measure MiniLM cold-start and peak memory on the chosen Render plan; do not assume 512 MB is sufficient.
- Confirm CSP does not block required Vercel/Render traffic.
- Confirm Render first-deploy hook behavior and health-check failure/recovery.

### Safe to defer

- Gemini latency/model-capacity improvements.
- Personalized Gemini enablement and paid-data terms review.
- Image recognition V2.
- Existing non-security ESLint debt.
- A deliberate, compatibility-managed move from local-storage JWTs to revocable HttpOnly sessions.

## H. Final verdict

**READY FOR STAGING**

The confirmed code and configuration blockers were fixed and focused checks pass. Staging is required to prove fresh Neon migration execution, seeding, CSP behavior, and Render MiniLM memory. Public production remains gated on dependency remediation and those staging results.

Audit execution summary:

- Newly executed: backend build; 9 targeted suites/54 tests; Prisma validation; schema-to-baseline SQL comparison; frontend TypeScript; 7 frontend header checks; production-only npm audits; targeted secret/history scan.
- Reused: 221 backend tests, frontend regression suite, PostgreSQL/Redis integration, AI privacy/account-isolation tests, and synthetic live Gemini evidence from the preceding commits.
- Skipped: full regression reruns (unaffected evidence), live Gemini (not needed and no real data permitted), Next production build (low disk), and live fresh-database migration (no safe disposable database; Docker was unresponsive).
- C: free space and final pushed commit are recorded in the final handoff.
