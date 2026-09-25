import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  sendEmail,
  contactFormTemplate,
  membershipApplicationTemplate,
  volunteerSignupTemplate,
} from '@/lib/email';
import { requireAuth } from '@/lib/auth';
import { upsertContactFromSubmission } from '@/lib/db/crm-queries';
import {
  createFormSubmission,
  getFormSubmissionById,
  getFormSubmissions,
  logActivity,
  updateFormSubmissionStatus,
  type FormSubmission,
} from '@/lib/db/queries';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@atlantasaddleclub.com';

const publicSubmissionSchema = z
  .object({
    type: z.enum(['contact', 'membership', 'volunteer', 'event-updates']),
    name: z.string().max(120).optional(),
    email: z.string().max(254).optional(),
    data: z.record(z.unknown()).optional().default({}),
  })
  .strict();

const publicEmailSchema = z.string().trim().email().max(254);

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function isFormStatus(value: string): value is FormSubmission['status'] {
  return ['new', 'replied', 'resolved'].includes(value);
}

function cleanText(value: unknown, maxLength: number): string {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, maxLength)).filter(Boolean).join(', ').slice(0, maxLength);
  }
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').trim().slice(0, maxLength);
}

function cleanSubject(value: unknown): string {
  return cleanText(value, 160).replace(/[\r\n]+/g, ' ');
}

function sanitizePublicData(data: Record<string, unknown>) {
  return {
    name: cleanText(data.name, 120),
    firstName: cleanText(data.firstName, 80),
    lastName: cleanText(data.lastName, 80),
    email: cleanText(data.email, 254),
    phone: cleanText(data.phone, 40),
    subject: cleanSubject(data.subject),
    message: cleanText(data.message, 5000),
    interest: cleanText(data.interest, 160),
    role: cleanText(data.role, 120),
    experience: cleanText(data.experience, 1500),
    interests: cleanText(data.interests, 600),
    opportunity: cleanText(data.opportunity, 240),
  };
}

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || undefined;
    const statusParam = searchParams.get('status') || undefined;
    const status = statusParam && isFormStatus(statusParam) ? statusParam : undefined;

    if (id) {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId < 1) {
        return NextResponse.json({ error: 'Invalid form submission ID' }, { status: 400 });
      }
      const submission = await getFormSubmissionById(numericId);
      if (!submission) {
        return NextResponse.json({ error: 'Form submission not found' }, { status: 404 });
      }
      return NextResponse.json(submission);
    }

    const submissions = await getFormSubmissions({ type, status });
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('[FORMS GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch form submissions' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!canWrite(user.role)) return forbidden();

    const body = await req.json();
    const id = Number(body.id);
    const status = String(body.status || '');

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Valid form submission ID required' }, { status: 400 });
    }
    if (!isFormStatus(status)) {
      return NextResponse.json({ error: 'Status must be new, replied, or resolved' }, { status: 400 });
    }

    const submission = await updateFormSubmissionStatus(id, status);
    if (!submission) {
      return NextResponse.json({ error: 'Form submission not found' }, { status: 404 });
    }

    await logActivity('form', `Marked ${submission.type} submission ${status}`, user.name || user.email);
    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('[FORMS PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update form submission' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = publicSubmissionSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 });
    }

    const { type, data: rawData } = parsed.data;

    // Honeypot: real forms keep this field empty and hidden from people.
    if (cleanText(rawData.website, 200)) {
      return NextResponse.json({ success: true, message: 'Form submitted successfully' });
    }

    const data = sanitizePublicData(rawData);
    const name =
      cleanText(parsed.data.name, 120) ||
      data.name ||
      [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    const emailCandidate = cleanText(parsed.data.email, 254) || data.email;
    const emailResult = publicEmailSchema.safeParse(emailCandidate);

    if (!emailResult.success) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const email = emailResult.data;
    const submissionData = { ...data, name, email };
    const submission = await createFormSubmission(type, submissionData);

    try {
      await upsertContactFromSubmission({
        type,
        name,
        email,
        formSubmissionId: submission.id,
        subject: data.subject || (type === 'event-updates' ? 'Event updates interest' : undefined),
        message: data.message || undefined,
        sourcePage: type,
      });
    } catch (crmError) {
      console.error('[FORM CRM]', crmError);
    }

    if (process.env.RESEND_API_KEY) {
      try {
        if (type === 'contact') {
          await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Contact: ${data.subject || 'Website inquiry'}`,
            html: contactFormTemplate({
              name: name || 'Website visitor',
              email,
              subject: data.subject || 'No subject',
              message: data.message,
            }),
            replyTo: email,
          });
        } else if (type === 'membership') {
          await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Membership Application: ${name || email}`,
            html: membershipApplicationTemplate({
              name,
              email,
              phone: data.phone,
              role: data.role,
              experience: data.experience,
              message: data.message,
            }),
            replyTo: email,
          });
        } else if (type === 'volunteer') {
          await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Volunteer Signup: ${name || email}`,
            html: volunteerSignupTemplate({
              volunteerName: name || 'Website visitor',
              opportunityTitle: data.interests || data.opportunity || 'Volunteer opportunity',
              contactEmail: ADMIN_EMAIL,
            }),
            replyTo: email,
          });
        } else if (type === 'event-updates') {
          await sendEmail({
            to: ADMIN_EMAIL,
            subject: `Event Updates Interest: ${name || email}`,
            html: contactFormTemplate({
              name: name || 'Website visitor',
              email,
              subject: `Event updates interest${data.interest ? ` — ${data.interest}` : ''}`,
              message: data.message || 'Requested to stay up to date on ASCA events.',
            }),
            replyTo: email,
          });
        }
      } catch (emailError) {
        console.error('[FORM EMAIL]', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('[FORM API]', error);
    return NextResponse.json({ error: 'Unable to submit the form right now' }, { status: 500 });
  }
}
