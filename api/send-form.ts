/**
 * POST /api/send-form — checks a website form, then emails it to the Fwdpod
 * inbox via Resend and saves it to Supabase for the admin.
 *
 * Runs as a Vercel function so RESEND_API_KEY and SUPABASE_SECRET_KEY never
 * reach the browser. In local development, vite.config.ts serves the same
 * handler at the same path.
 *
 * Body: { form: "booking" | "contact", botcheck, source_page, name, email,
 *         company, message, and for bookings need, role_or_outcome,
 *         engagement, start_date }
 */

import { checkEmail } from './_email.js';
import { saveSubmission } from './_store.js';

const RESEND_API_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const TO = process.env.FORM_TO_EMAIL || 'contact.fwdpod@gmail.com';
const FROM: Record<FormKind, string> = {
  booking: 'Fwdpod Bookings <bookings@fwdpod.com>',
  contact: 'Fwdpod Website <hello@fwdpod.com>',
};

type FormKind = 'booking' | 'contact';

const NEEDS = ['Individual specialist', 'AI pod', 'Not sure yet'];
const ENGAGEMENTS = ['Hourly', 'Daily', 'Monthly', 'Not sure'];

// Only the site itself (and local / preview builds) may post here
const ALLOWED_ORIGIN = /^(https:\/\/(www\.)?fwdpod\.com|https:\/\/[a-z0-9-]+\.vercel\.app|http:\/\/localhost(:\d+)?|http:\/\/127\.0\.0\.1(:\d+)?)$/;

// Best-effort limit per IP, per function instance: 5 forms per 10 minutes
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

// And per email address, whatever the IP: 3 forms per hour
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const recentByEmail = new Map<string, number[]>();

function emailRateLimited(email: string): boolean {
  const now = Date.now();
  const hits = (recentByEmail.get(email) ?? []).filter(t => now - t < EMAIL_WINDOW_MS);
  hits.push(now);
  recentByEmail.set(email, hits);
  return hits.length > MAX_PER_EMAIL;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin') ?? '';
  if (!ALLOWED_ORIGIN.test(origin)) return json(403, { ok: false, error: 'Origin not allowed' });

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { ok: false, error: 'Too many requests. Please try again in a few minutes.' });

  const apiKey = process.env.RESEND_API_KEY;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request' });
  }

  // Spam trap: report success so bots learn nothing, but send nothing
  if (body.botcheck === true || body.botcheck === 'true') return json(200, { ok: true });

  const form = body.form === 'booking' || body.form === 'contact' ? (body.form as FormKind) : null;
  const fields = {
    name: text(body.name, 200),
    email: text(body.email, 254),
    company: text(body.company, 200),
    need: text(body.need, 40),
    role_or_outcome: text(body.role_or_outcome, 300),
    engagement: text(body.engagement, 20),
    start_date: text(body.start_date, 10),
    message: text(body.message, 3000),
    source_page: text(body.source_page, 100) || (form === 'booking' ? '/configure' : '/contact'),
  };

  const problems: string[] = [];
  if (!form) problems.push('form');
  if (!fields.name) problems.push('name');
  if (!fields.company) problems.push('company');
  if (form === 'booking' && !NEEDS.includes(fields.need)) problems.push('need');
  if (form === 'booking' && fields.engagement && !ENGAGEMENTS.includes(fields.engagement)) problems.push('engagement');
  if (form === 'booking' && fields.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.start_date)) problems.push('start_date');
  if (form === 'contact' && !fields.message) problems.push('message');
  if (problems.length) return json(400, { ok: false, error: `Missing or invalid: ${problems.join(', ')}` });

  // Same address check the form runs as you type: format, mail server, throwaway inbox
  const emailCheck = await checkEmail(fields.email);
  if (!emailCheck.valid) return json(400, { ok: false, field: 'email', reason: emailCheck.reason, error: emailCheck.message });
  if (emailRateLimited(fields.email.toLowerCase())) {
    return json(429, { ok: false, error: 'We already have a few messages from this address. Please try again later.' });
  }

  // Saved for the admin alongside the email; the admin lists read these columns
  const row: Record<string, string | null> =
    form === 'booking'
      ? {
          source_page: fields.source_page,
          name: fields.name,
          email: fields.email,
          company: fields.company,
          need: fields.need,
          role_or_outcome: fields.role_or_outcome || null,
          engagement: fields.engagement || null,
          start_date: fields.start_date || null,
          message: fields.message || null,
        }
      : { source_page: fields.source_page, name: fields.name, email: fields.email, company: fields.company, message: fields.message };
  const saving = saveSubmission(form === 'booking' ? 'booking_requests' : 'contact_messages', row);

  const rows: [string, string][] =
    form === 'booking'
      ? [
          ['Name', fields.name],
          ['Email', fields.email],
          ['Company', fields.company],
          ['What they need', fields.need],
          ['Role or outcome', fields.role_or_outcome || 'Not given'],
          ['Preferred engagement', fields.engagement || 'Not given'],
          ['Ideal start date', fields.start_date || 'Not given'],
          ['Anything else', fields.message || 'Not given'],
          ['Sent from', `fwdpod.com${fields.source_page}`],
        ]
      : [
          ['Name', fields.name],
          ['Email', fields.email],
          ['Company', fields.company],
          ['Message', fields.message],
          ['Sent from', `fwdpod.com${fields.source_page}`],
        ];

  const subject =
    form === 'booking' ? `Booking request: ${fields.company} (${fields.need})` : `Contact message: ${fields.company}`;
  const heading = form === 'booking' ? 'New booking request' : 'New contact message';

  const mailing = !apiKey ? Promise.reject(new Error('RESEND_API_KEY is not set')) : fetch(RESEND_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM[form!],
      to: [TO],
      reply_to: fields.email,
      subject,
      text: `${heading}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReply to this email to answer ${fields.name}.`,
      html:
        `<h2 style="font-family:Arial,sans-serif;font-size:18px;margin:0 0 12px">${heading}</h2>` +
        `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
        rows
          .map(([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#555;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>` +
            `<td style="padding:6px 0;color:#0A0A0A;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
          .join('') +
        `</table><p style="font-family:Arial,sans-serif;font-size:13px;color:#555;margin-top:16px">Reply to this email to answer ${escapeHtml(fields.name)}.</p>`,
    }),
  });

  // Email and save in parallel. Either one is enough to keep the request, so
  // one outage never loses it; only both failing is an error.
  const [mailed, saved] = await Promise.allSettled([
    mailing.then(async response => {
      if (!response.ok) throw new Error(`Resend returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }),
    saving,
  ]);
  if (mailed.status === 'rejected') console.error('send-form: email failed:', (mailed.reason as Error).message);
  if (saved.status === 'rejected') console.error('send-form: save failed:', (saved.reason as Error).message);
  if (mailed.status === 'rejected' && saved.status === 'rejected') {
    return json(502, { ok: false, error: 'Your message could not be sent' });
  }
  return json(200, { ok: true });
}
