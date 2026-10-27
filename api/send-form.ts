/**
 * POST /api/send-form — emails a website form to the Fwdpod inbox via Resend.
 *
 * Runs as a Vercel function so RESEND_API_KEY never reaches the browser. In
 * local development, vite.config.ts serves the same handler at the same path.
 *
 * Body: { form: "booking" | "contact", botcheck, source_page, name, email,
 *         company, message, and for bookings need, role_or_outcome,
 *         engagement, start_date }
 */

const RESEND_API_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const TO = process.env.FORM_TO_EMAIL || 'contact.fwdpod@gmail.com';
const FROM: Record<FormKind, string> = {
  booking: 'Fwdpod Bookings <bookings@fwdpod.com>',
  contact: 'Fwdpod Website <hello@fwdpod.com>',
};

type FormKind = 'booking' | 'contact';

const NEEDS = ['Individual specialist', 'AI pod', 'Not sure yet'];
const ENGAGEMENTS = ['Hourly', 'Daily', 'Monthly', 'Not sure'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (!apiKey) {
    console.error('send-form: RESEND_API_KEY is not set');
    return json(500, { ok: false, error: 'Email is not configured' });
  }

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
    email: text(body.email, 320),
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
  if (!EMAIL_PATTERN.test(fields.email)) problems.push('email');
  if (!fields.company) problems.push('company');
  if (form === 'booking' && !NEEDS.includes(fields.need)) problems.push('need');
  if (form === 'booking' && fields.engagement && !ENGAGEMENTS.includes(fields.engagement)) problems.push('engagement');
  if (form === 'booking' && fields.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.start_date)) problems.push('start_date');
  if (form === 'contact' && !fields.message) problems.push('message');
  if (problems.length) return json(400, { ok: false, error: `Missing or invalid: ${problems.join(', ')}` });

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

  const response = await fetch(RESEND_API_URL, {
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

  if (!response.ok) {
    console.error('send-form: Resend returned', response.status, (await response.text()).slice(0, 300));
    return json(502, { ok: false, error: 'Email could not be sent' });
  }
  return json(200, { ok: true });
}
