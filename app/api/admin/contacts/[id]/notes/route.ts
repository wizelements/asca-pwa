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

import { getNotesForContact, createContactNote } from '@/lib/db/crm-queries';

const noteSchema = z.object({
  note: z.string().min(1),
  visibility: z.enum(['admin', 'sensitive']).default('admin'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const notes = await getNotesForContact(Number(id));
    return NextResponse.json({ notes });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();
    const { id } = await params;
    const body = await req.json();
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const note = await createContactNote({ ...parsed.data, contactId: Number(id), authorAdminId: Number(user.sub) });
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
