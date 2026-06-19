import { SignJWT, jwtVerify } from 'jose';
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me');

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
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
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
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
    .sign(JWT_SECRET);
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
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

export function getAuthToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

export async function requireAuth(request: Request): Promise<JWTPayload> {
  const token = getAuthToken(request);
  if (!token) {
    throw new Error('Unauthorized');
  }
  const payload = await verifyToken(token);
  if (!payload) {
    throw new Error('Unauthorized');
  }
  return payload;
}
