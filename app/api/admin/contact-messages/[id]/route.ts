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

import { getMessageById, updateContactMessage } from '@/lib/db/crm-queries';

const updateSchema = z.object({
  status: z.enum(['new', 'replied', 'resolved']).optional(),
  assignedTo: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const message = await updateContactMessage(Number(id), parsed.data);
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    return NextResponse.json(message);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const message = await getMessageById(Number(id));
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    return NextResponse.json(message);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
