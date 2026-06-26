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

import { getContactWithRelations, updateContact } from '@/lib/db/crm-queries';

const updateSchema = z.object({
  type: z.enum(['person', 'organization']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.enum(['contact-form', 'event-updates', 'membership-form', 'volunteer-form', 'manual', 'member-import', 'rsvp']).optional(),
  status: z.enum(['lead', 'subscriber', 'member', 'volunteer', 'sponsor', 'alumni', 'inactive']).optional(),
  lifecycleStage: z.enum(['awareness', 'engaged', 'member', 'volunteer', 'advocate', 'inactive']).optional(),
  interests: z.array(z.string()).optional(),
  consentEmail: z.boolean().optional(),
  consentSms: z.boolean().optional(),
  notesSummary: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const result = await getContactWithRelations(Number(id));
    if (!result) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);
    const contact = await updateContact(Number(id), parsed.data);
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorized();
    return serverError(error);
  }
}
