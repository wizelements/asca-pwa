import type { JWTPayload } from '../../auth.ts';

export type ServiceRole = JWTPayload['role'];

export function requireAuth(user: JWTPayload | null | undefined): asserts user is JWTPayload {
  if (!user) {
    throw new Error('Unauthorized');
  }
}

export function canViewAdmin(user: JWTPayload): boolean {
  return user.role === 'admin' || user.role === 'editor' || user.role === 'viewer';
}

export function canEdit(user: JWTPayload): boolean {
  return user.role === 'admin' || user.role === 'editor';
}

export function canAdmin(user: JWTPayload): boolean {
  return user.role === 'admin';
}

export function assertEdit(user: JWTPayload): void {
  if (!canEdit(user)) {
    throw new Error('Forbidden');
  }
}

export function assertAdmin(user: JWTPayload): void {
  if (!canAdmin(user)) {
    throw new Error('Forbidden');
  }
}
