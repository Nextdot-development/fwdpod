import test from 'node:test';
import assert from 'node:assert/strict';
import { abstractVerifier, checkEmail, makeDohResolver, type MailboxVerifier, type MxResolver } from '../api/_email';

// Fake DNS so the tests never touch the network
const dnsError = (code: string) => Object.assign(new Error(code), { code });
const fakeDns: MxResolver = async domain => {
  if (domain === 'gmail.com' || domain === 'examplebank.com') return [{ exchange: 'mx.' + domain }];
  if (domain === 'no-mail.example') return [{ exchange: '.' }];
  if (domain === 'slow.example') throw dnsError('ETIMEOUT');
  throw dnsError('ENOTFOUND');
};

test('accepts an address whose domain has a mail server', async () => {
  assert.deepEqual(await checkEmail('Priya@ExampleBank.com', fakeDns), { valid: true, suggestion: undefined });
});

test('rejects a malformed address', async () => {
  for (const bad of [
    '', 'priya', 'priya@', '@examplebank.com', 'priya@examplebank', 'priya examplebank.com',
    'priya@-examplebank.com', 'priya@examplebank-.com', 'priya@examplebank..com', 'priya@examplebank.c0m',
    '.priya@examplebank.com', 'priya.@examplebank.com', 'pri..ya@examplebank.com', 'priya@@examplebank.com',
    `${'a'.repeat(65)}@examplebank.com`,
  ]) {
    const result = await checkEmail(bad, fakeDns);
    assert.equal(result.valid, false, bad);
    assert.equal(result.reason, 'format', bad);
  }
});

test('rejects a domain that does not exist', async () => {
  const result = await checkEmail('rahul@asdfghjkl-not-real.com', fakeDns);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'domain');
  assert.equal(result.message, "This email domain doesn't appear to accept email. Please check the address.");
});

test('rejects a domain that publishes a null MX (accepts no email)', async () => {
  const result = await checkEmail('rahul@no-mail.example', fakeDns);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'domain');
});

test('rejects throwaway inboxes without a DNS lookup', async () => {
  let looked = false;
  const result = await checkEmail('test@mailinator.com', async () => { looked = true; return [{ exchange: 'mx' }]; });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'disposable');
  assert.equal(looked, false);
});

test('suggests the intended address for a common typo', async () => {
  const result = await checkEmail('priya@gmial.com', fakeDns);
  assert.equal(result.valid, false);
  assert.equal(result.suggestion, 'priya@gmail.com');
});

test('lets the address through when DNS itself fails, so real people are not blocked', async () => {
  assert.equal((await checkEmail('priya@slow.example', fakeDns)).valid, true);
});

// Fake mailbox service: only these inboxes exist at gmail.com
const fakeMailbox: MailboxVerifier = async email =>
  email === 'priya@gmail.com' ? { status: 'deliverable', risk: 'low' }
  : email === 'broken@gmail.com' ? { status: 'unknown' }
  : email === 'burner@gmail.com' ? { status: 'deliverable', disposable: true }
  : email === 'risky@gmail.com' ? { status: 'deliverable', risk: 'high' }
  : { status: 'undeliverable' };

test('rejects an inbox the mail server says does not exist', async () => {
  const result = await checkEmail('six-made-up@gmail.com', fakeDns, fakeMailbox);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'mailbox');
});

test('accepts an inbox that exists', async () => {
  assert.equal((await checkEmail('Priya@gmail.com', fakeDns, fakeMailbox)).valid, true);
});

test('lets the address through when the mailbox service is unsure or down', async () => {
  assert.equal((await checkEmail('broken@gmail.com', fakeDns, fakeMailbox)).valid, true);
  assert.equal((await checkEmail('down@gmail.com', fakeDns, async () => { throw new Error('quota'); })).valid, true);
});

test('skips the mailbox service when the domain already failed', async () => {
  let asked = false;
  await checkEmail('rahul@asdfghjkl-not-real.com', fakeDns, async () => { asked = true; return { status: 'deliverable' }; });
  assert.equal(asked, false);
});

test('rejects an inbox the service flags as disposable, but lets high risk through', async () => {
  assert.equal((await checkEmail('burner@gmail.com', fakeDns, fakeMailbox)).reason, 'disposable');
  assert.equal((await checkEmail('risky@gmail.com', fakeDns, fakeMailbox)).valid, true);
});

test('rejects test and placeholder addresses without asking the mailbox service', async () => {
  let asked = false;
  const spy: MailboxVerifier = async () => { asked = true; return { status: 'deliverable' }; };
  for (const fake of ['test@gmail.com', 'demo@yahoo.com', 'Test123@gmail.com', 'fake.user@outlook.com', 'asdf@gmail.com', 'aaaa@gmail.com', '12345@gmail.com', 'noreply@examplebank.com']) {
    assert.equal((await checkEmail(fake, fakeDns, spy)).reason, 'placeholder', fake);
  }
  assert.equal(asked, false);
});

test('does not mistake real names for placeholders', async () => {
  const real: MailboxVerifier = async () => ({ status: 'deliverable' });
  for (const ok of ['priya.sharma@gmail.com', 'testa.rossi@gmail.com', 'demetrius@gmail.com', 'rahul1990@gmail.com', 'info@examplebank.com']) {
    assert.equal((await checkEmail(ok, fakeDns, real)).valid, true, ok);
  }
});

test('rejects a generic name on a free provider, but not on a company domain', async () => {
  const generic: MailboxVerifier = async email => ({ status: 'deliverable', role: true, free: email.endsWith('@gmail.com') });
  assert.equal((await checkEmail('sales@gmail.com', fakeDns, generic)).reason, 'placeholder');
  assert.equal((await checkEmail('sales@examplebank.com', fakeDns, generic)).valid, true);
});

// Abstract Email Reputation responses, per docs.abstractapi.com/api/email-reputation
const reply = (status: number, body: unknown = {}) => async () => new Response(JSON.stringify(body), { status });
const reputation = (status: string, status_detail: string, extra: object = {}) =>
  reply(200, { email_deliverability: { status, status_detail }, email_quality: { is_disposable: false }, email_risk: { address_risk_status: 'low' }, ...extra });

test('Abstract: reads deliverable, invalid mailbox, disposable and risk', async () => {
  assert.deepEqual(await abstractVerifier('k', 'https://x/', reputation('deliverable', 'valid_email'))('a@b.com'), { status: 'deliverable', disposable: false, role: false, free: false, risk: 'low' });
  assert.equal((await abstractVerifier('k', 'https://x/', reputation('undeliverable', 'invalid_mailbox'))('a@b.com')).status, 'undeliverable');
  const burner = await abstractVerifier('k', 'https://x/', reputation('deliverable', 'valid_email', { email_quality: { is_disposable: true } }))('a@b.com');
  assert.equal(burner.disposable, true);
});

test('Abstract: a full mailbox or a down mail server is not treated as a fake address', async () => {
  for (const detail of ['full_mailbox', 'unavailable_server']) {
    assert.equal((await abstractVerifier('k', 'https://x/', reputation('undeliverable', detail))('a@b.com')).status, 'unknown', detail);
  }
  assert.equal((await abstractVerifier('k', 'https://x/', reputation('unknown', ''))('a@b.com')).status, 'unknown');
});

test('Abstract: bad key, no credits, rate limit, outage and network failure all mean unknown', async () => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    for (const code of [401, 403, 422, 429, 500, 503]) {
      assert.deepEqual(await abstractVerifier('k', 'https://x/', reply(code, { error: {} }))('a@b.com'), { status: 'unknown' }, String(code));
    }
    const offline = (async () => { throw new TypeError('fetch failed'); }) as typeof fetch;
    assert.deepEqual(await abstractVerifier('k', 'https://x/', offline)('a@b.com'), { status: 'unknown' });
  } finally {
    console.warn = warn;
  }
});

test('Abstract: with no key set, makes no request', async () => {
  let called = false;
  const spy = (async () => { called = true; return new Response('{}'); }) as typeof fetch;
  assert.deepEqual(await abstractVerifier('', 'https://x/', spy)('a@b.com'), { status: 'unknown' });
  assert.equal(called, false);
});

test('Abstract: sends the key in a header, never in the URL', async () => {
  let seenUrl = '';
  let seenAuth = '';
  const spy = (async (url: string, init?: RequestInit) => {
    seenUrl = url;
    seenAuth = new Headers(init?.headers).get('authorization') ?? '';
    return new Response('{}');
  }) as typeof fetch;
  await abstractVerifier('secret-key-123', 'https://x/', spy)('a@b.com');
  assert.equal(seenUrl.includes('secret-key-123'), false);
  assert.equal(seenAuth, 'Bearer secret-key-123');
});

test('a slow mailbox service times out and lets the address through', async () => {
  const hang: MailboxVerifier = () => new Promise(() => {});
  const started = Date.now();
  assert.equal((await checkEmail('slowpoke@gmail.com', fakeDns, hang)).valid, true);
  assert.ok(Date.now() - started < 7000);
});

// DNS-over-HTTPS answers, keyed by "domain type"
const fakeDoh = (zone: Record<string, { Status: number; Answer?: { type: number; data: string }[] }>) =>
  (async (url: string) => {
    const q = new URL(url).searchParams;
    const answer = zone[`${q.get('name')} ${q.get('type')}`] ?? { Status: 0, Answer: [] };
    return new Response(JSON.stringify(answer), { status: 200 });
  }) as typeof fetch;

test('DNS: a domain with MX records receives email', async () => {
  const resolve = makeDohResolver(fakeDoh({ 'acme.com MX': { Status: 0, Answer: [{ type: 15, data: '10 mx.acme.com.' }] } }));
  assert.deepEqual(await resolve('acme.com'), [{ exchange: 'mx.acme.com' }]);
});

test('DNS: a domain with no MX but an A record still receives email (implicit MX)', async () => {
  const resolve = makeDohResolver(fakeDoh({ 'small.co MX': { Status: 0 }, 'small.co A': { Status: 0, Answer: [{ type: 1, data: '203.0.113.7' }] } }));
  assert.deepEqual(await resolve('small.co'), [{ exchange: 'small.co' }]);
  const result = await checkEmail('rahul@small.co', resolve, async () => ({ status: 'unknown' }));
  assert.equal(result.valid, true);
});

test('DNS: a domain with no mail records at all, or that does not exist, is rejected', async () => {
  const resolve = makeDohResolver(fakeDoh({ 'gone.example MX': { Status: 3 } }));
  for (const domain of ['empty.example', 'gone.example']) {
    const result = await checkEmail(`rahul@${domain}`, resolve, async () => ({ status: 'deliverable' }));
    assert.equal(result.reason, 'domain', domain);
    assert.equal(result.message, "This email domain doesn't appear to accept email. Please check the address.");
  }
});

test('DNS: when no DNS provider answers, the address is let through', async () => {
  const down = (async () => { throw new TypeError('fetch failed'); }) as typeof fetch;
  assert.equal((await checkEmail('rahul@acme.com', makeDohResolver(down), async () => ({ status: 'unknown' }))).valid, true);
});

test('uses the agreed wording for format and disposable errors', async () => {
  assert.equal((await checkEmail('priya@', fakeDns)).message, 'Please enter a valid email address.');
  assert.equal((await checkEmail('rahul@mailinator.com', fakeDns)).message, 'Please use a valid work email address. Temporary email addresses are not accepted.');
});
