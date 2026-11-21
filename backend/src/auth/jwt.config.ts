/**
 * JWT Configuration and Secret Validation
 *
 * Ensures that production environments strictly enforce high-entropy JWT secrets
 * (minimum 32 characters) while providing seamless fallbacks for local development and test suites.
 */

export const MIN_JWT_SECRET_LENGTH = 32;
export const DEV_JWT_SECRET_FALLBACK = 'caltrack-dev-insecure-jwt-secret-key-32chars';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret || secret.trim().length === 0) {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing or empty in production mode. Refusing to boot application.',
      );
    }
    if (secret.length < MIN_JWT_SECRET_LENGTH) {
      throw new Error(
        `FATAL: JWT_SECRET in production must be at least ${MIN_JWT_SECRET_LENGTH} characters long (current length: ${secret.length}).`,
      );
    }
    return secret;
  }

  // Development / Test / CI fallback
  return secret || DEV_JWT_SECRET_FALLBACK;
}
