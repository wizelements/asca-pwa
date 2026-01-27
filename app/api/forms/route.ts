/**
 * Form Submission Handler
 * Handles contact, membership, volunteer, and donation forms
 * POST /api/forms
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, contactFormTemplate, membershipApplicationTemplate, volunteerSignupTemplate } from '@/lib/email';

interface FormSubmission {
  type: 'contact' | 'membership' | 'volunteer' | 'donation';
  name: string;
  email: string;
  data: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body: FormSubmission = await req.json();
    const { type, name, email, data } = body;

    if (!type || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, email' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'info@atlantasaddleclub.org';

    let emailSent = false;

    // Send appropriate emails based on form type
    if (type === 'contact') {
      const result = await sendEmail({
        to: adminEmail,
        subject: `New Contact: ${data.subject}`,
        html: contactFormTemplate({
          name,
          email,
          subject: data.subject || 'No subject',
          message: data.message || '',
        }),
        replyTo: email,
      });
      emailSent = result.success;
    } else if (type === 'membership') {
      const result = await sendEmail({
        to: adminEmail,
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
        to: adminEmail,
        subject: `New Volunteer Signup: ${name}`,
        html: volunteerSignupTemplate({
          volunteerName: name,
          opportunityTitle: data.opportunity || 'Volunteer Opportunity',
          contactEmail: adminEmail,
        }),
        replyTo: email,
      });
      emailSent = result.success;
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      emailSent,
    });
  } catch (error) {
    console.error('[FORM API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
