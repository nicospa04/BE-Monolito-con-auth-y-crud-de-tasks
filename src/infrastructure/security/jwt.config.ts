const developmentJwtSecret = 'development-only-change-me';

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return developmentJwtSecret;
}
