import { NextRequest, NextResponse } from 'next/server';

import {
  getPasswordVersion,
  hashPassword,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from '@/lib/auth';
import { adminPasswordResetTemplate, sendEmail } from '@/lib/email';
import { getUserByEmail, logActivity, updateUserPassword } from '@/lib/db/queries';

const PASSWORD_RESET_RECIPIENTS = ['silverwatkins@gmail.com'];
const RESET_TOKEN_EXPIRES_MINUTES = 30;
const MIN_PASSWORD_LENGTH = 12;

function getResetUrl(request: NextRequest, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const url = new URL('/admin/reset-password', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

async function requestReset(request: NextRequest, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = normalizedEmail ? await getUserByEmail(normalizedEmail) : null;

  if (user?.isActive && user.role === 'admin') {
    const token = await signPasswordResetToken({
      sub: String(user.id),
      email: user.email,
      passwordVersion: getPasswordVersion(user.password),
    });
    const resetUrl = getResetUrl(request, token);

    const results = await Promise.all(
      PASSWORD_RESET_RECIPIENTS.map((recipient) =>
        sendEmail({
          to: recipient,
          subject: 'ASCA Admin Password Reset',
          html: adminPasswordResetTemplate({
            adminEmail: user.email,
            resetUrl,
            expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES,
          }),
        })
      )
    );

    if (!results.some((result) => result.success)) {
      return NextResponse.json({ error: 'Unable to send reset email' }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'If that admin account can be reset, a link has been sent to the approved recovery email.',
  });
}

async function resetPassword(token: string, password: string) {
  if (!token) {
    return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  const payload = await verifyPasswordResetToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Reset link is invalid or expired' }, { status: 400 });
  }

  const user = await getUserByEmail(payload.email);
  if (
    !user?.isActive ||
    user.role !== 'admin' ||
    String(user.id) !== payload.sub ||
    getPasswordVersion(user.password) !== payload.passwordVersion
  ) {
    return NextResponse.json({ error: 'Reset link is invalid or expired' }, { status: 400 });
  }

  await updateUserPassword(user.id, hashPassword(password));

  try {
    await logActivity('auth', 'Reset admin password', user.email);
  } catch (error) {
    console.error('[PASSWORD RESET ACTIVITY]', error);
  }

  return NextResponse.json({ success: true, message: 'Password reset successfully' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || 'request');

    if (action === 'request') {
      return requestReset(request, String(body.email || ''));
    }

    if (action === 'reset') {
      return resetPassword(String(body.token || ''), String(body.password || ''));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[PASSWORD RESET]', error);
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
