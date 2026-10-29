import test from 'node:test';
import assert from 'node:assert/strict';

// The handler talks to Resend, Supabase and DNS; all three are faked here, so
// these tests never send email, write data or touch the network.
process.env.RESEND_API_KEY = 're_test_key';
process.env.RESEND_API_URL = 'https://resend.test/emails';
process.env.VITE_SUPABASE_URL = 'https://db.test';
process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
delete process.env.ABSTRACT_API_KEY;

const calls: { url: string; init?: RequestInit }[] = [];
let resendStatus = 200;
let supabaseStatus = 201;
globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });
  if (url.startsWith('https://resend.test')) return new Response('{}', { status: resendStatus });
  if (url.startsWith('https://db.test')) return new Response('', { status: supabaseStatus });
  // DNS-over-HTTPS: every domain has a mail server except nomail.example
  const name = new URL(url).searchParams.get('name');
  if (name === 'nomail.example') return new Response(JSON.stringify({ Status: 3 }), { status: 200 });
  return new Response(JSON.stringify({ Status: 0, Answer: [{ type: 15, data: `10 mx.${name}.` }] }), { status: 200 });
}) as typeof fetch;

const { POST } = await import('../api/send-form');

let ipCounter = 0;
const send = (body: Record<string, unknown>, { origin = 'https://www.fwdpod.com', ip = `10.0.0.${++ipCounter}` } = {}) =>
  POST(new Request('https://www.fwdpod.com/api/send-form', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }));

const contact = (over: Record<string, unknown> = {}) => ({
  form: 'contact', name: 'Priya Sharma', email: 'priya.sharma@examplebank.com', company: 'Example Bank', message: 'Hello', ...over,
});

const reset = () => { calls.length = 0; resendStatus = 200; supabaseStatus = 201; };
const saved = () => calls.filter(c => c.url.startsWith('https://db.test'));
const mailed = () => calls.filter(c => c.url.startsWith('https://resend.test'));

test('a valid contact message is emailed and saved from the server', async () => {
  reset();
  const response = await send(contact());
  assert.equal(response.status, 200);
  assert.equal(mailed().length, 1);
  assert.equal(saved().length, 1);
  assert.equal(saved()[0].url, 'https://db.test/rest/v1/contact_messages');
  assert.equal(new Headers(saved()[0].init?.headers).get('apikey'), 'sb_secret_test');
  assert.deepEqual(JSON.parse(String(saved()[0].init?.body)), {
    source_page: '/contact', name: 'Priya Sharma', email: 'priya.sharma@examplebank.com', company: 'Example Bank', message: 'Hello',
  });
});

test('direct requests with a bad email are refused and nothing is emailed or saved', async () => {
  for (const [email, reason] of [['', 'format'], ['priya@', 'format'], ['rahul@mailinator.com', 'disposable'], ['test@gmail.com', 'placeholder'], ['rahul@nomail.example', 'domain']]) {
    reset();
    const response = await send(contact({ email }));
    const body = await response.json();
    assert.equal(response.status, 400, email);
    assert.equal(body.field, 'email', email);
    assert.equal(body.reason, reason, email);
    assert.equal(mailed().length + saved().length, 0, email);
  }
});

test('missing required fields are refused', async () => {
  reset();
  const response = await send(contact({ name: '', message: '  ' }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /name.*message/);
  assert.equal(calls.length, 0);
});

test('a client-sent "verified" flag changes nothing', async () => {
  reset();
  const response = await send(contact({ email: 'rahul@mailinator.com', isVerified: true, valid: true }));
  assert.equal(response.status, 400);
  assert.equal(saved().length, 0);
});

test('requests from other websites are refused', async () => {
  reset();
  assert.equal((await send(contact(), { origin: 'https://evil.example' })).status, 403);
  assert.equal(calls.length, 0);
});

test('the spam trap reports success but sends and saves nothing', async () => {
  reset();
  const response = await send(contact({ botcheck: true }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 0);
});

test('more than 5 forms from one IP in 10 minutes are refused', async () => {
  reset();
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await send(contact({ email: `person${i}@examplebank.com` }), { ip: '10.9.9.9' })).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
});

test('more than 3 forms from one email address in an hour are refused, even from different IPs', async () => {
  reset();
  const statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await send(contact({ email: 'repeat.sender@examplebank.com' }))).status);
  assert.deepEqual(statuses, [200, 200, 200, 429]);
});

test('if email fails the message is still saved, and vice versa; both failing is an error', async () => {
  reset();
  resendStatus = 500;
  assert.equal((await send(contact({ email: 'a.one@examplebank.com' }))).status, 200);
  reset();
  supabaseStatus = 500;
  assert.equal((await send(contact({ email: 'a.two@examplebank.com' }))).status, 200);
  reset();
  resendStatus = 500;
  supabaseStatus = 500;
  assert.equal((await send(contact({ email: 'a.three@examplebank.com' }))).status, 502);
});

test('a booking request is saved to booking_requests with its own fields', async () => {
  reset();
  const response = await send({
    form: 'booking', name: 'Priya Sharma', email: 'priya.b@examplebank.com', company: 'Example Bank', need: 'AI pod',
    role_or_outcome: '', engagement: 'Monthly', start_date: '', message: '',
  });
  assert.equal(response.status, 200);
  assert.equal(saved()[0].url, 'https://db.test/rest/v1/booking_requests');
  const row = JSON.parse(String(saved()[0].init?.body));
  assert.equal(row.need, 'AI pod');
  assert.equal(row.role_or_outcome, null);
  assert.equal(row.start_date, null);
});
