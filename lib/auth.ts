import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

import { getUserByEmail } from '@/lib/db/queries';

export const ADMIN_SESSION_COOKIE = 'asca_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret || secret.length < 32 || /^(your-|change-me|fallback)/i.test(secret)) {
    throw new Error('NEXTAUTH_SECRET must be configured with at least 32 random characters');
  }
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  passwordVersion: string;
}

export interface PasswordResetPayload {
  sub: string;
  email: string;
  purpose: 'admin-password-reset';
  passwordVersion: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setSubject(payload.sub)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      !['admin', 'editor', 'viewer'].includes(String(payload.role)) ||
      typeof payload.passwordVersion !== 'string'
    ) {
      return null;
    }
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getPasswordVersion(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex');
}

export async function signPasswordResetToken(payload: Omit<PasswordResetPayload, 'purpose'>): Promise<string> {
  return new SignJWT({
    email: payload.email,
    purpose: 'admin-password-reset',
    passwordVersion: payload.passwordVersion,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .setSubject(payload.sub)
    .sign(getJwtSecret());
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (
      payload.purpose !== 'admin-password-reset' ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.passwordVersion !== 'string'
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      purpose: 'admin-password-reset',
      passwordVersion: payload.passwordVersion,
    };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2_sha512$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2_sha512') return false;
  const [, salt, hash] = parts;
  const computed = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  const expected = Buffer.from(hash, 'hex');
  if (computed.length !== expected.length) return false;
  try {
    return timingSafeEqual(computed, expected);
  } catch {
    return false;
  }
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === name) {
      try {
        return decodeURIComponent(rawValue.join('='));
      } catch {
        return rawValue.join('=');
      }
    }
  }
  return null;
}

export function getAuthToken(request: Request): string | null {
  // Browser admin sessions use the protected cookie. Prefer it so legacy
  // client code cannot accidentally shadow a valid session with Bearer null.
  const sessionCookie = getCookie(request, ADMIN_SESSION_COOKIE);
  if (sessionCookie) return sessionCookie;

  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  }
  return null;
}

export async function requireAuth(request: Request): Promise<JWTPayload> {
  const token = getAuthToken(request);
  if (!token) throw new Error('Unauthorized');

  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');

  const user = await getUserByEmail(payload.email);
  if (
    !user?.isActive ||
    String(user.id) !== payload.sub ||
    user.role !== payload.role ||
    getPasswordVersion(user.password) !== payload.passwordVersion
  ) {
    throw new Error('Unauthorized');
  }

  return {
    ...payload,
    email: user.email,
    name: user.name || user.email,
    role: user.role,
  };
}
