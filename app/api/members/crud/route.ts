import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createMember,
  deleteMember,
  getMemberById,
  getMembers,
  updateMember,
  logActivity,
  type Member,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const activeParam = searchParams.get('active');

    if (id) {
      const member = await getMemberById(Number(id));
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json(member);
    }

    const active = activeParam !== null ? activeParam === 'true' : undefined;
    const members = await getMembers(active);
    return NextResponse.json(members);
  } catch (error) {
    console.error('[MEMBERS GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const member = await createMember({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      bio: body.bio,
      photo: body.photo,
      roles: body.roles || [],
      isActive: body.isActive !== false,
      isVerified: Boolean(body.isVerified),
      joinDate: body.joinDate ? new Date(body.joinDate) : new Date(),
    } as any);

    await logActivity('member', `Created member "${member.firstName} ${member.lastName}"`, user.name || user.email);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error('[MEMBERS POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const data: Partial<Member> = {};
    if (updates.firstName !== undefined) data.firstName = updates.firstName;
    if (updates.lastName !== undefined) data.lastName = updates.lastName;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.bio !== undefined) data.bio = updates.bio;
    if (updates.photo !== undefined) data.photo = updates.photo;
    if (updates.roles !== undefined) data.roles = updates.roles;
    if (updates.isActive !== undefined) data.isActive = Boolean(updates.isActive);
    if (updates.isVerified !== undefined) data.isVerified = Boolean(updates.isVerified);

    const member = await updateMember(Number(id), data);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await logActivity('member', `Updated member "${member.firstName} ${member.lastName}"`, user.name || user.email);
    return NextResponse.json(member);
  } catch (error: any) {
    console.error('[MEMBERS PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const member = await getMemberById(Number(id));
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await deleteMember(Number(id));
    await logActivity('member', `Deleted member "${member.firstName} ${member.lastName}"`, user.name || user.email);

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error: any) {
    console.error('[MEMBERS DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
