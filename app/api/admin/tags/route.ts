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

import { getAllTags, createTag } from '@/lib/db/crm-queries';

const tagSchema = z.object({
  name: z.string().min(1),
  color: z.string().default('#737373'),
  category: z.enum(['interest', 'role', 'source', 'status', 'committee', 'custom']).default('custom'),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();
    const body = await req.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const tag = await createTag(parsed.data);
    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
