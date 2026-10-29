/**
 * Email address checks for the website forms, shared by /api/check-email and
 * /api/send-form. (Files starting with "_" are helpers, not Vercel functions.)
 *
 * Rejects what can be shown to be wrong: a bad format, a domain with no mail
 * server, a throwaway address, or (via Abstract, when ABSTRACT_API_KEY is set)
 * an inbox the mail server says doesn't exist. Common domain typos get a
 * suggested fix. Anything uncertain is let through.
 */

export type EmailReason = 'format' | 'placeholder' | 'domain' | 'disposable' | 'mailbox';

export interface EmailCheck {
  valid: boolean;
  reason?: EmailReason;
  message?: string;
  /** A likely intended address, e.g. for "gmial.com" typos. */
  suggestion?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Throwaway inbox services
const DISPOSABLE = new Set([
  '10minutemail.com', '10minutemail.net', '20minutemail.com', 'burnermail.io', 'discard.email', 'dispostable.com',
  'emailondeck.com', 'fakeinbox.com', 'getairmail.com', 'getnada.com', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'grr.la', 'mailcatch.com', 'maildrop.cc', 'mailinator.com',
  'mailinator.net', 'mailnesia.com', 'mailpoof.com', 'mintemail.com', 'moakt.com', 'mohmal.com', 'mytemp.email',
  'nada.email', 'sharklasers.com', 'spamgourmet.com', 'tempail.com', 'tempinbox.com', 'tempmail.com', 'tempmail.net',
  'tempmailo.com', 'temp-mail.org', 'temp-mail.io', 'throwawaymail.com', 'trashmail.com', 'trashmail.de',
  'trashmail.net', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'mailtemp.net', 'emailfake.com', 'tmpmail.org',
  'tmpmail.net', 'inboxkitten.com', 'spambox.us', 'mail.tm', 'tempr.email',
]);

// Misspellings of common providers -> the intended domain
const TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com', 'gmali.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.comm': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com', 'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com', 'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com', 'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com', 'icoud.com': 'icloud.com',
  'rediffmai.com': 'rediffmail.com', 'rediffmal.com': 'rediffmail.com',
};

// Names people type to get past a form, not their own address. Real inboxes
// like demo@yahoo.com exist, so the mailbox check alone lets these through.
const PLACEHOLDER_NAMES = new Set([
  'test', 'testing', 'tester', 'demo', 'fake', 'dummy', 'sample', 'example', 'temp', 'spam', 'junk', 'trash',
  'asdf', 'asdfgh', 'qwerty', 'abc', 'abcd', 'abcdef', 'xyz', 'foo', 'bar', 'foobar', 'null', 'none', 'nobody',
  'noreply', 'no-reply', 'donotreply', 'user', 'username', 'email', 'mail', 'name', 'yourname', 'youremail',
  'myemail', 'someone', 'anonymous', 'nomail', 'random', 'hello123', 'admin123',
]);

const isPlaceholder = (local: string) => {
  const base = local.replace(/[._+-]/g, '');
  return (
    PLACEHOLDER_NAMES.has(local) ||
    // test1, test123, demo_2, fake.user
    /^(test|demo|fake|dummy|sample|example|asdf|qwerty)(\d+|user|mail|email)?$/.test(base) ||
    // aaaa, xxxx, 1111
    /^(.)\1{2,}$/.test(base) ||
    // 123, 12345, 0987
    /^\d{1,6}$/.test(base)
  );
};

/** Resolves a domain's MX hosts. Injected in tests so they never touch the network. */
export type MxResolver = (domain: string) => Promise<{ exchange: string }[]>;

// MX lookup over DNS-over-HTTPS, so it works the same on Vercel and on any
// laptop (some local resolvers refuse Node's own DNS client). Cloudflare first,
// Google as a fallback. Status 3 = the domain doesn't exist.
const DOH_ENDPOINTS = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve'];

const dohResolver: MxResolver = async domain => {
  for (const endpoint of DOH_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?name=${encodeURIComponent(domain)}&type=MX`, { headers: { Accept: 'application/dns-json' } });
      if (!response.ok) continue;
      const data = (await response.json()) as { Status: number; Answer?: { type: number; data: string }[] };
      if (data.Status === 3) throw Object.assign(new Error('NXDOMAIN'), { code: 'ENOTFOUND' });
      if (data.Status !== 0) continue;
      // MX answers read "10 mx.example.com."
      const hosts = (data.Answer ?? []).filter(a => a.type === 15).map(a => ({ exchange: a.data.split(' ').pop()!.replace(/\.$/, '') || '.' }));
      if (hosts.length === 0) throw Object.assign(new Error('no MX'), { code: 'ENODATA' });
      return hosts;
    } catch (err) {
      if ((err as { code?: string }).code) throw err;
      // Network trouble with this provider: try the next
    }
  }
  throw Object.assign(new Error('DNS-over-HTTPS unavailable'), { code: 'ETIMEOUT' });
};

const defaultResolver: MxResolver = dohResolver;

/**
 * A verification service's view of one address. 'undeliverable' = the mail
 * server says no such inbox; 'unknown' covers catch-all domains, servers that
 * won't answer, and any outage, bad key or used-up quota.
 */
export interface MailboxVerdict {
  status: 'deliverable' | 'undeliverable' | 'unknown';
  disposable?: boolean;
  /** A shared or generic name (admin@, demo@) rather than one person's inbox. */
  role?: boolean;
  /** A free provider such as Gmail or Yahoo. */
  free?: boolean;
  risk?: 'low' | 'medium' | 'high';
}
export type MailboxVerifier = (email: string) => Promise<MailboxVerdict>;

// What the forms turn away, beyond inboxes that don't exist. Both are
// business-enquiry forms, so throwaway inboxes are refused, and so is a generic
// name on a free provider (demo@yahoo.com): nobody's own inbox. A generic name
// on a company domain (info@acme.com) is a real contact point and passes.
// "High risk" alone is not proof of a bad lead, so it is let through.
const POLICY = { rejectDisposable: true, rejectFreeRole: true, rejectHighRisk: false };

// Undeliverable reasons that mean the address itself is wrong. A full mailbox
// or a mail server that's down belongs to a real person, so those pass.
const BAD_ADDRESS = new Set(['invalid_mailbox', 'invalid_format', 'dns_record_not_found']);

const UNKNOWN: MailboxVerdict = { status: 'unknown' };

/**
 * Abstract Email Reputation API (docs.abstractapi.com/api/email-reputation).
 * The key is server-only (ABSTRACT_API_KEY) and goes in a Bearer header, never
 * the URL. With no key, every address is 'unknown' and only local checks run.
 */
export function abstractVerifier(
  key = process.env.ABSTRACT_API_KEY,
  url = process.env.ABSTRACT_API_URL || 'https://emailreputation.abstractapi.com/v1/',
  fetchImpl: typeof fetch = fetch
): MailboxVerifier {
  return async email => {
    if (!key) return UNKNOWN;
    try {
      const response = await fetchImpl(`${url}?email=${encodeURIComponent(email)}`, { headers: { Authorization: `Bearer ${key}` } });
      if (!response.ok) {
        // 401 bad key, 422/403 out of credits, 429 over 1 request/second, 5xx outage.
        // Log the status only: never the key or the address.
        console.warn(`[email-check] Abstract responded ${response.status}; allowing the address`);
        return UNKNOWN;
      }
      const data = (await response.json()) as {
        email_deliverability?: { status?: string; status_detail?: string };
        email_quality?: { is_disposable?: boolean; is_role?: boolean; is_free_email?: boolean };
        email_risk?: { address_risk_status?: string };
      };
      const status = data.email_deliverability?.status;
      const risk = data.email_risk?.address_risk_status;
      return {
        status:
          status === 'deliverable' ? 'deliverable'
          : status === 'undeliverable' && BAD_ADDRESS.has(data.email_deliverability?.status_detail ?? '') ? 'undeliverable'
          : 'unknown',
        disposable: data.email_quality?.is_disposable === true,
        role: data.email_quality?.is_role === true,
        free: data.email_quality?.is_free_email === true,
        risk: risk === 'low' || risk === 'medium' || risk === 'high' ? risk : undefined,
      };
    } catch {
      console.warn('[email-check] Abstract unreachable; allowing the address');
      return UNKNOWN;
    }
  };
}

// Each lookup costs a credit (100 on the free plan); the form checks on blur and
// the server again on submit, so remember answers for an hour on this instance.
const mailboxCache = new Map<string, { at: number; verdict: MailboxVerdict }>();
const CACHE_MS = 60 * 60 * 1000;

const cachedVerify = async (email: string, verify: MailboxVerifier): Promise<MailboxVerdict> => {
  const hit = mailboxCache.get(email);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.verdict;
  const verdict = await withTimeout(verify(email), 5000).catch(() => UNKNOWN);
  // Only cache real answers, so a brief outage doesn't stick
  if (verdict.status !== 'unknown') mailboxCache.set(email, { at: Date.now(), verdict });
  if (mailboxCache.size > 5000) mailboxCache.clear();
  return verdict;
};

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

export async function checkEmail(
  raw: string,
  resolveMx: MxResolver = defaultResolver,
  verifyMailbox: MailboxVerifier = abstractVerifier()
): Promise<EmailCheck> {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return { valid: false, reason: 'format', message: 'Please enter a valid email address, like name@company.com.' };
  }
  const [local, domain] = [email.slice(0, email.lastIndexOf('@')), email.slice(email.lastIndexOf('@') + 1)];
  const typoFix = TYPOS[domain];
  const suggestion = typoFix ? `${local}@${typoFix}` : undefined;

  if (DISPOSABLE.has(domain)) {
    return { valid: false, reason: 'disposable', message: "Please use your work email. Temporary email addresses aren't accepted." };
  }

  if (isPlaceholder(local)) {
    return { valid: false, reason: 'placeholder', message: "Please enter your own email address. Test or placeholder addresses aren't accepted." };
  }

  try {
    const hosts = await withTimeout(resolveMx(domain), 3000);
    // A "null MX" (a single "." host) means the domain accepts no email
    const usable = hosts.filter(h => h.exchange && h.exchange !== '.');
    if (usable.length === 0) {
      return { valid: false, reason: 'domain', message: `"${domain}" doesn't accept email. Please check the address.`, suggestion };
    }
  } catch (err) {
    const code = (err as { code?: string }).code;
    // The domain or its mail records don't exist
    if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN') {
      return { valid: false, reason: 'domain', message: `We couldn't find "${domain}". Please check the email address.`, suggestion };
    }
    // DNS trouble on our side (timeout, server failure): don't turn a real person away
    return { valid: true, suggestion };
  }

  // The domain takes email; now ask whether this inbox exists (e.g. a made-up @gmail.com)
  const verdict = await cachedVerify(email, verifyMailbox);
  if (verdict.status === 'undeliverable') {
    return { valid: false, reason: 'mailbox', message: "This email address doesn't seem to exist. Please check it for typos.", suggestion };
  }
  if (POLICY.rejectDisposable && verdict.disposable) {
    return { valid: false, reason: 'disposable', message: "Please use your work email. Temporary email addresses aren't accepted." };
  }
  if (POLICY.rejectFreeRole && verdict.role && verdict.free) {
    return { valid: false, reason: 'placeholder', message: "Please enter your own email address. Test or placeholder addresses aren't accepted." };
  }
  if (POLICY.rejectHighRisk && verdict.risk === 'high') {
    return { valid: false, reason: 'mailbox', message: "We couldn't verify this email address. Please use your work email." };
  }
  return { valid: true, suggestion };
}
