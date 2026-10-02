import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'ritam_review_agency_educational_super_secure_key_2026';

export interface TokenPayload {
  userId?: string;
  adminId?: string;
  role: 'user' | 'admin' | 'superadmin';
  whatsapp?: string;
  username?: string;
  exp: number;
}

export function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInHours: number = 72): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (Date.now() / 1000 > payload.exp) return null; // Expired

    return payload;
  } catch {
    return null;
  }
}
