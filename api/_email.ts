/**
 * Email address checks for the website forms, shared by /api/check-email and
 * /api/send-form. (Files starting with "_" are helpers, not Vercel functions.)
 *
 * No check can prove a mailbox exists without sending to it, so this rejects
 * what can be shown to be wrong: a bad format, a domain with no mail server,
 * or a throwaway address. Common domain typos get a suggested fix.
 */

export type EmailReason = 'format' | 'domain' | 'disposable';

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

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

export async function checkEmail(raw: string, resolveMx: MxResolver = defaultResolver): Promise<EmailCheck> {
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
  return { valid: true, suggestion };
}
