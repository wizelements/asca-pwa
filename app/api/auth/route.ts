import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateUserLogin } from '@/lib/db/queries';
import { getPasswordVersion, verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action !== 'login') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
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

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AUTH]', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
