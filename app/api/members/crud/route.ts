import { connectDB } from '@/lib/db';
import { Member } from '@/lib/models/Member';
import { NextRequest, NextResponse } from 'next/server';

// GET all members or by ID
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const active = searchParams.get('active');
    const verified = searchParams.get('verified');

    if (id) {
      const member = await Member.findById(id);
      if (!member) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(member);
    }

    const query: any = {};
    if (active !== null) query.isActive = active === 'true';
    if (verified !== null) query.isVerified = verified === 'true';

    const members = await Member.find(query).sort({ joinDate: -1 });

    return NextResponse.json(members, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[MEMBERS GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// CREATE member
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    const { firstName, lastName, email, roles } = data;
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await Member.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const member = new Member({
      ...data,
      joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
    });

    const saved = await member.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('[MEMBERS POST]', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}

// UPDATE member
export async function PUT(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== member.email) {
      const existing = await Member.findOne({ email: data.email });
      if (existing) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await Member.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[MEMBERS PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE member
export async function DELETE(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    const deleted = await Member.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('[MEMBERS DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
