import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';

const SESSION_COOKIE = 'nisaap-session';

// SECURITY: Require SESSION_SECRET in production
const _rawSecret = process.env.SESSION_SECRET;
if (!_rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: SESSION_SECRET environment variable is required in production');
}
const SESSION_SECRET = _rawSecret || 'nisaap-dev-secret-change-in-production';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  // Guard against malformed or missing password hashes
  if (!hash || !hash.includes(':')) return false;
  const parts = hash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

export interface SessionData {
  userId: string;
  username: string;
  role: string;
}

function signSessionData(payload: string): string {
  const hmac = createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

export function createSessionCookie(sessionData: SessionData): string {
  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  const signature = signSessionData(payload);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const sameSite = process.env.NODE_ENV === 'production' ? '; SameSite=Lax' : '; SameSite=Strict';
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; HttpOnly${sameSite}; Max-Age=86400${secure}`;
}

export function getSessionFromCookie(cookieHeader: string | null): SessionData | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;
  try {
    const value = sessionCookie.substring(SESSION_COOKIE.length + 1);
    const dotIndex = value.lastIndexOf('.');
    if (dotIndex === -1) return null;

    const payload = value.substring(0, dotIndex);
    const signature = value.substring(dotIndex + 1);

    const expectedSignature = signSessionData(payload);
    // Timing-safe comparison to prevent side-channel attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as SessionData;
  } catch {
    return null;
  }
}

export function getDestroySessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const sameSite = process.env.NODE_ENV === 'production' ? '; SameSite=Lax' : '; SameSite=Strict';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly${sameSite}; Max-Age=0${secure}`;
}
