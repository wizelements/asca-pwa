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

import { getTasksForContact, createContactTask } from '@/lib/db/crm-queries';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']).default('open'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedTo: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const tasks = await getTasksForContact(Number(id));
    return NextResponse.json({ tasks });
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
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const task = await createContactTask({ ...parsed.data, contactId: Number(id), createdBy: Number(user.sub) });
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
