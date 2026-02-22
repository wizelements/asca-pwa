import { connectDB } from '@/lib/db';
import { Member } from '@/lib/models/Member';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query: Record<string, string | boolean> = { isActive: true };
    if (role) {
      query.roles = role;
    }

    const members = await Member.find(query)
      .sort({ lastName: 1 })
      .lean();

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.email || !data.firstName || !data.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!data.duesNextDueAt) {
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 3);
      data.duesNextDueAt = nextDue;
    }

    const member = new Member(data);
    await member.save();
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}
