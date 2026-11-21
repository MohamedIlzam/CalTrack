/**
 * CORS Configuration and Production Origin Validation
 *
 * In production mode, requires an explicitly configured FRONTEND_URL to prevent
 * unauthorized cross-origin access or arbitrary origin reflection.
 * In development mode, allows reflection or localhost origins for seamless DX.
 */

export function getCorsOrigins(): string[] | boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrlEnv = process.env.FRONTEND_URL;

  if (isProduction) {
    if (!frontendUrlEnv || !frontendUrlEnv.trim()) {
      throw new Error(
        'FATAL: FRONTEND_URL environment variable is required in production mode to prevent unauthorized cross-origin requests. Refusing to boot application.',
      );
    }

    const origins = frontendUrlEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    if (origins.length === 0) {
      throw new Error(
        'FATAL: FRONTEND_URL contains no valid origins in production mode.',
      );
    }

    // Refuse wildcard in production
    if (origins.includes('*')) {
      throw new Error(
        'FATAL: Wildcard origin (*) is not permitted in production mode when credentials are enabled.',
      );
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
