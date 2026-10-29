/**
 * POST /api/check-email { email } -> { valid, reason?, message?, suggestion? }
 *
 * Lets the website forms check an address as soon as it's typed, before the
 * request is emailed and saved. /api/send-form runs the same check again.
 */
import { checkEmail } from './_email';

const ALLOWED_ORIGIN = /^(https:\/\/(www\.)?fwdpod\.com|https:\/\/[a-z0-9-]+\.vercel\.app|http:\/\/localhost(:\d+)?|http:\/\/127\.0\.0\.1(:\d+)?)$/;

// Best-effort limit per IP, per function instance: 10 checks per 10 minutes.
// Each check can spend a paid verification credit, so keep this tight; a real
// visitor checks one or two addresses.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const recent = new Map<string, number[]>();

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST(request: Request): Promise<Response> {
  if (!ALLOWED_ORIGIN.test(request.headers.get('origin') ?? '')) return json(403, { error: 'Origin not allowed' });

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (hits.length > MAX_PER_WINDOW) return json(429, { error: 'Too many requests' });

  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email : '';
  } catch {
    return json(400, { error: 'Invalid request' });
  }
  if (email.length > 254) return json(400, { error: 'Invalid request' });
  return json(200, { ...(await checkEmail(email)) });
}
