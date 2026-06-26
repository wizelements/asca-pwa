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

import { getTasks, type TaskStatus, type TaskPriority } from '@/lib/db/crm-queries';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TaskStatus | undefined;
    const priority = searchParams.get('priority') as TaskPriority | undefined;
    const assignedTo = searchParams.get('assignedTo') ? Number(searchParams.get('assignedTo')) : undefined;
    const contactId = searchParams.get('contactId') ? Number(searchParams.get('contactId')) : undefined;
    const limit = Number(searchParams.get('limit') || 50);
    const offset = Number(searchParams.get('offset') || 0);
    const result = await getTasks({ status, priority, assignedTo, contactId, limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
