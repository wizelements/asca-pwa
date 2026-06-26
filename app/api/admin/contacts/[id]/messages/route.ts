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

import { getMessagesForContact, createContactMessage } from '@/lib/db/crm-queries';

const messageSchema = z.object({
  formSubmissionId: z.number().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
  status: z.enum(['new', 'replied', 'resolved']).default('new'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const messages = await getMessagesForContact(Number(id));
    return NextResponse.json({ messages });
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
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const message = await createContactMessage({ ...parsed.data, contactId: Number(id) });
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
