import { NextRequest, NextResponse } from 'next/server';

import { hashPassword, requireAuth, verifyPassword } from '@/lib/auth';
import { getUserByEmail, logActivity, updateUserPassword } from '@/lib/db/queries';

const MIN_PASSWORD_LENGTH = 12;

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'New password must be different from the current password' }, { status: 400 });
    }

    const user = await getUserByEmail(authUser.email);
    if (!user?.isActive) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    await updateUserPassword(user.id, hashPassword(newPassword));
    await logActivity('auth', 'Changed account password', user.email);

    return NextResponse.json({ success: true, message: 'Password updated. Sign in again with the new password.' });
  } catch (error: any) {
    console.error('[ADMIN PASSWORD]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
