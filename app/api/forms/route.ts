import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmail,
  contactFormTemplate,
  membershipApplicationTemplate,
  volunteerSignupTemplate,
} from '@/lib/email';
import { requireAuth } from '@/lib/auth';
import {
  upsertContactFromSubmission,
} from '@/lib/db/crm-queries';
import {
  createFormSubmission,
  getFormSubmissionById,
  getFormSubmissions,
  logActivity,
  updateFormSubmissionStatus,
  type FormSubmission,
} from '@/lib/db/queries';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@atlantasaddleclub.com';

function isFormStatus(value: string): value is FormSubmission['status'] {
  return ['new', 'replied', 'resolved'].includes(value);
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
      const submission = await getFormSubmissionById(Number(id));
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
    const body = await req.json();
    const id = Number(body.id);
    const status = String(body.status || '');

    if (!id) {
      return NextResponse.json({ error: 'Form submission ID required' }, { status: 400 });
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
    const body = await req.json();
    const type: string = body.type;
    const data: Record<string, any> = body.data || {};

    const name: string =
      body.name ||
      data.name ||
      [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    const email: string = body.email || data.email || '';

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type and email' },
        { status: 400 }
      );
    }

    const submission = await createFormSubmission(type, { ...data, name, email });

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

    const emailConfigured = Boolean(process.env.RESEND_API_KEY);
    let emailSent = false;

    if (emailConfigured) {
      try {
        if (type === 'contact') {
          const result = await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Contact: ${data.subject || 'Website inquiry'}`,
            html: contactFormTemplate({
              name: name || 'Website visitor',
              email,
              subject: data.subject || 'No subject',
              message: data.message || '',
            }),
            replyTo: email,
          });
          emailSent = result.success;
        } else if (type === 'membership') {
          const result = await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Membership Application: ${name}`,
            html: membershipApplicationTemplate({
              name,
              email,
              phone: data.phone || '',
              role: data.role || '',
              experience: data.experience || '',
              message: data.message || '',
            }),
            replyTo: email,
          });
          emailSent = result.success;
        } else if (type === 'volunteer') {
          const result = await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Volunteer Signup: ${name}`,
            html: volunteerSignupTemplate({
              volunteerName: name,
              opportunityTitle: data.interests || data.opportunity || 'Volunteer Opportunity',
              contactEmail: ADMIN_EMAIL,
            }),
            replyTo: email,
          });
          emailSent = result.success;
        } else if (type === 'event-updates') {
          const result = await sendEmail({
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
          emailSent = result.success;
        }
      } catch (err) {
        console.error('[FORM EMAIL]', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      emailSent,
      emailConfigured,
    });
  } catch (error) {
    console.error('[FORM API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
