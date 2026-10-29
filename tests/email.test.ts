import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEmail, type MxResolver } from '../api/_email';

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
  for (const bad of ['', 'priya', 'priya@', '@examplebank.com', 'priya@examplebank', 'priya examplebank.com']) {
    const result = await checkEmail(bad, fakeDns);
    assert.equal(result.valid, false, bad);
    assert.equal(result.reason, 'format', bad);
  }
});

test('rejects a domain that does not exist', async () => {
  const result = await checkEmail('someone@asdfghjkl-not-real.com', fakeDns);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'domain');
  assert.match(result.message ?? '', /asdfghjkl-not-real\.com/);
});

test('rejects a domain that publishes a null MX (accepts no email)', async () => {
  const result = await checkEmail('someone@no-mail.example', fakeDns);
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
