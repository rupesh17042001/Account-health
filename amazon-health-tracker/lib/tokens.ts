import jwt from 'jsonwebtoken';

const SHARE_TOKEN_SECRET = process.env.SHARE_TOKEN_SECRET || 'fallback-secret';

interface ShareTokenPayload {
  brandId: string;
  orgId: string;
  iat?: number;
}

/**
 * Sign a share token for a brand. No expiry by default (permanent link).
 * The agency can revoke by nullifying the token in the database.
 */
export function signShareToken(brandId: string, orgId: string): string {
  const payload: ShareTokenPayload = { brandId, orgId };
  return jwt.sign(payload, SHARE_TOKEN_SECRET);
}

/**
 * Verify and decode a share token. Returns null if invalid.
 */
export function verifyShareToken(token: string): ShareTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SHARE_TOKEN_SECRET) as ShareTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
