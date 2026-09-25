import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getPasswordVersion,
  requireAuth,
  signToken,
  verifyPassword,
} from '@/lib/auth';
import { getUserByEmail, updateUserLogin } from '@/lib/db/queries';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    return NextResponse.json({
      user: {
        id: Number(user.sub),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user?.isActive || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await updateUserLogin(user.id);

    const token = await signToken({
      sub: String(user.id),
      email: user.email,
      name: user.name || user.email,
      role: user.role,
      passwordVersion: getPasswordVersion(user.password),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        role: user.role,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('[AUTH]', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
