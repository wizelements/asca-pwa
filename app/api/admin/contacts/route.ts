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

import { getContacts, createContact } from '@/lib/db/crm-queries';
import type {
  ContactSource,
  ContactStatus,
  LifecycleStage,
} from '@/lib/crm/types';

const contactSchema = z.object({
  type: z.enum(['person', 'organization']).default('person'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.enum(['contact-form', 'event-updates', 'membership-form', 'volunteer-form', 'manual', 'member-import', 'rsvp', 'jotform']).default('manual'),
  status: z.enum(['lead', 'subscriber', 'member', 'volunteer', 'sponsor', 'alumni', 'inactive']).default('lead'),
  lifecycleStage: z.enum(['awareness', 'engaged', 'member', 'volunteer', 'advocate', 'inactive']).default('awareness'),
  interests: z.array(z.string()).default([]),
  consentEmail: z.boolean().default(false),
  consentSms: z.boolean().default(false),
  notesSummary: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const status = searchParams.get('status') as ContactStatus | undefined;
    const source = searchParams.get('source') as ContactSource | undefined;
    const lifecycleStage = searchParams.get('lifecycleStage') as LifecycleStage | undefined;
    const tagId = searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined;
    const limit = Number(searchParams.get('limit') || 50);
    const offset = Number(searchParams.get('offset') || 0);
    const result = await getContacts({ q, status, source, lifecycleStage, tagId, limit, offset });
    return NextResponse.json(result);
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
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const contact = await createContact(parsed.data);
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
