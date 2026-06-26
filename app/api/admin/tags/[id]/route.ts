import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const roleSchema = z.enum(['admin', 'editor', 'viewer']);

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

import { deleteTag } from '@/lib/db/crm-queries';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();
    const { id } = await params;
    const deleted = await deleteTag(Number(id));
    if (!deleted) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
