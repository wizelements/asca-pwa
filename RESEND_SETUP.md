# Resend Email Setup for ASCA PWA

## Step 1: Create Resend Account & Get API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up with your email
3. Navigate to **API Keys** in settings
4. Create a new API key (or copy existing one)
5. Copy the key and save it

## Step 2: Configure Domain with Cloudflare DNS

### Option A: Use Subdomain (Recommended)
If you own a Cloudflare-managed domain, use a subdomain for ASCA emails:

**Domain:** `asca-pwa.org` (or whatever domain you choose)

### Add DNS Records in Cloudflare:

Go to your Cloudflare dashboard → **DNS** → **Records**

**Add these 3 records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| MX | asca-pwa.org | `feedback-dsn.com` | Auto |
| TXT (SPF) | asca-pwa.org | `v=spf1 include:sendmail.resend.com ~all` | Auto |
| CNAME (DKIM) | `default._domainkey.asca-pwa.org` | `default.dkim.asca-pwa.org` | Auto |

**In Resend Dashboard:**
1. Go to **Domains**
2. Click **Add Domain**
3. Enter: `asca-pwa.org`
4. Resend will show you the exact DNS records needed
5. Add them to Cloudflare
6. Click "Verify Domain" in Resend (wait 5-10 minutes for DNS propagation)

### Option B: Use Email Routing (Free Cloudflare)

If you just want form notifications forwarded to your personal email:

1. In Cloudflare DNS, add an MX record:
   - **Name:** `@` (root domain)
   - **Value:** `asca-pwa.org` (or your domain)
   - **Priority:** 10

2. Set up Cloudflare Email Routing:
   - Go to **Email Routing** in Cloudflare
   - Create rule: `noreply@asca-pwa.org` → forward to your email

This is free and works for receiving form submissions, but Resend is better for sending branded emails.

## Step 3: Update Environment Variables

**In `.env.local`:**

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@asca-pwa.org
RESEND_FROM_NAME=Atlanta Saddle Club Association
ADMIN_EMAIL=admin@atlantasaddleclub.org
```

**In Vercel Dashboard:**

1. Go to **Settings** → **Environment Variables**
2. Add the same values for `production`, `preview`, and `development`
3. Redeploy

## Step 4: Install Resend Package

```bash
npm install resend
```

## Step 5: Test Email Sending

Create a test script at `scripts/test-email.js`:

```javascript
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const result = await resend.emails.send({
    from: 'noreply@asca-pwa.org',
    to: 'your-email@example.com',
    subject: 'Test Email from ASCA PWA',
    html: '<h1>Hello!</h1><p>This is a test email from ASCA PWA.</p>',
  });

  console.log('Email sent:', result);
}

testEmail().catch(console.error);
```

Run: `node scripts/test-email.js`

## Step 6: Verify Forms Are Sending

1. Go to [https://asca-pwa.vercel.app/get-involved](https://asca-pwa.vercel.app/get-involved)
2. Fill out and submit a contact form
3. Check your admin email for the submission
4. Check Resend Dashboard → **Emails** to see delivery status

## Troubleshooting

### Emails not sending?
- Check Resend API key is correct
- Verify domain is verified in Resend (should have green checkmark)
- Check Vercel environment variables are deployed
- View logs: `vercel logs --tail`

### DNS not propagating?
- Wait 10-30 minutes (sometimes longer)
- Clear your DNS cache: On Windows, run `ipconfig /flushdns`
- Check status: `nslookup asca-pwa.org`

### Emails going to spam?
- Resend handles SPF/DKIM automatically once domain is verified
- Make sure "From" name matches brand (looks professional)
- Avoid spam trigger words in templates

## Email Templates Used

The system sends emails for:
1. **Contact Forms** → Admin gets submission
2. **Membership Applications** → Admin gets application
3. **Volunteer Signups** → Admin gets signup, volunteer gets confirmation
4. **Donations** → Donor gets receipt
5. **Event RSVPs** → Attendee gets confirmation

All templates are in `lib/email.ts` and can be customized with branding.
