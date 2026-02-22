import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

// Temporary auth handler (for Phase 2)
// Replace with full Next-Auth v5 when v5 is stable
// Currently using custom JWT token system

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'login') {
      await connectDB();
      const user = await User.findOne({ email });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const bcrypt = await import('bcrypt');
      const isValid = await bcrypt.default.compare(password, user.password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Update last login
      await User.updateOne(
        { _id: user._id },
        { lastLogin: new Date() }
      );

      // Return user data (frontend handles JWT)
      return NextResponse.json({
        success: true,
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      });
    }

    if (action === 'logout') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[AUTH]', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
