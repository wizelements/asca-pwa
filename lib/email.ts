/**
 * Email Service using Resend
 * Send transactional emails for ASCA PWA
 */

import { Resend } from 'resend';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@asca-pwa.org';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'ASCA PWA';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: EmailOptions) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      reply_to: replyTo || 'info@atlantasaddleclub.org',
    });

    const emailId = 'id' in result ? result.id : result.data?.id;
    console.log('[EMAIL] Sent:', { to, subject, id: emailId });
    return { success: true, id: emailId };
  } catch (error) {
    console.error('[EMAIL] Failed:', { to, subject, error });
    return { success: false, error: String(error) };
  }
}

/**
 * Contact Form Submission Email (to admin)
 */
export function contactFormTemplate(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr />
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Submitted to ASCA PWA on ${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  `;
}

/**
 * Membership Application Email (to admin)
 */
export function membershipApplicationTemplate(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  message: string;
}): string {
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">New Membership Application</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Role:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.role}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Experience:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.experience}</td>
          </tr>
        </table>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Submitted to ASCA PWA on ${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  `;
}

/**
 * Event RSVP Confirmation Email (to user)
 */
export function eventRSVPTemplate(data: {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  rsvpStatus: string;
}): string {
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">RSVP Confirmation</h2>
        <p>Hi ${data.attendeeName},</p>
        <p>Thank you for your RSVP to our event!</p>
        <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #4a4b02;">
          <h3 style="color: #1a1a1a; margin-top: 0;">${data.eventTitle}</h3>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Time:</strong> ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.eventLocation}</p>
          <p><strong>Status:</strong> <span style="color: #4a4b02; font-weight: bold;">${data.rsvpStatus}</span></p>
        </div>
        <p>See you there!</p>
        <p style="color: #666;">
          <em>Atlanta Saddle Club Association</em><br />
          We Ride To Inspire
        </p>
      </body>
    </html>
  `;
}

/**
 * Donation Thank You Email (to donor)
 */
export function donationThankYouTemplate(data: {
  donorName: string;
  amount: number;
  transactionId: string;
}): string {
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">Thank You for Your Donation</h2>
        <p>Hi ${data.donorName},</p>
        <p>We sincerely thank you for your generous donation of <strong>$${(data.amount / 100).toFixed(2)}</strong> to the Atlanta Saddle Club Association.</p>
        <p style="background: #f9f9f9; padding: 12px; border-left: 4px solid #4a4b02;">
          <strong>Transaction ID:</strong> ${data.transactionId}
        </p>
        <p>Your support helps us continue our mission to promote horsemanship, sportsmanship, and community enrichment.</p>
        <p>With gratitude,<br /><em>ASCA Leadership</em></p>
      </body>
    </html>
  `;
}

/**
 * Volunteer Signup Confirmation Email (to volunteer)
 */
export function volunteerSignupTemplate(data: {
  volunteerName: string;
  opportunityTitle: string;
  contactEmail: string;
}): string {
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">Thank You for Volunteering</h2>
        <p>Hi ${data.volunteerName},</p>
        <p>Thank you for signing up to volunteer with the Atlanta Saddle Club Association!</p>
        <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #4a4b02;">
          <h3 style="color: #1a1a1a; margin-top: 0;">${data.opportunityTitle}</h3>
          <p>We'll be in touch soon with more details.</p>
          <p><strong>Questions?</strong> Contact us at <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
        </div>
        <p style="color: #666;">
          <em>Atlanta Saddle Club Association</em><br />
          We Ride To Inspire
        </p>
      </body>
    </html>
  `;
}
