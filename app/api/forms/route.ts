/**
 * Form Submission Handler
 * Handles contact, membership, volunteer, and event-update interest forms.
 * POST /api/forms
 *
 * Accepts a flexible payload: { type, data } where `data` carries the fields.
 * Name/email may live at the top level or inside `data`.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmail,
  contactFormTemplate,
  membershipApplicationTemplate,
  volunteerSignupTemplate,
} from '@/lib/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@atlantasaddleclub.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type: string = body.type;
    const data: Record<string, any> = body.data || {};

    // Resolve name/email whether they're top-level or nested in `data`.
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

    // If no email backend is configured, accept gracefully without pretending
    // a notification was sent.
    const emailConfigured = Boolean(process.env.RESEND_API_KEY);
    let emailSent = false;

    if (emailConfigured) {
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
