/**
 * CORS Configuration and Production Origin Validation
 *
 * In production mode, allows only explicitly configured HTTPS origins. When
 * FRONTEND_URL is absent, CORS fails closed without preventing the API from
 * serving non-browser traffic such as Render health checks.
 * In development mode, allows reflection or localhost origins for seamless DX.
 */

export function getCorsOrigins(): string[] | boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrlEnv = process.env.FRONTEND_URL;

  if (isProduction) {
    if (!frontendUrlEnv || !frontendUrlEnv.trim()) {
      return [];
    }

    const origins = frontendUrlEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    if (origins.length === 0) {
      return [];
    }

    // Refuse wildcard in production
    if (origins.includes('*')) {
      throw new Error(
        'FATAL: Wildcard origin (*) is not permitted in production mode when credentials are enabled.',
      );
    }

    for (const origin of origins) {
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error(`FATAL: Invalid production CORS origin: ${origin}`);
      }
      if (
        parsed.protocol !== 'https:' ||
        parsed.origin !== origin ||
        parsed.username ||
        parsed.password
      ) {
        throw new Error(
          `FATAL: Production CORS origins must be exact HTTPS origins without paths or credentials: ${origin}`,
        );
      }
    }

    return origins;
  }

  // Non-production (development, test, preview)
  if (frontendUrlEnv && frontendUrlEnv.trim()) {
    const origins = frontendUrlEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    if (origins.length > 0) {
      return origins;
    }
  }

  // In local development without FRONTEND_URL, return true to reflect requesting origin (localhost / LAN mobile)
  return true;
}
