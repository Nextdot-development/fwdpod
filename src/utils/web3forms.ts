/**
 * Sends a website form to the Fwdpod inbox through Web3Forms.
 *
 * The access key is public by design (it can only send to the inbox it was
 * created for) and is set per environment: see .env.example. Without it, or on
 * any failure, this throws so the form can show its error state instead of a
 * false success.
 */
export const CONTACT_EMAIL = 'contact.fwdpod@gmail.com';

const FORM_ENDPOINT = import.meta.env.VITE_BOOKING_FORM_ENDPOINT || 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export async function sendToInbox(fields: Record<string, string | boolean>): Promise<void> {
  if (!ACCESS_KEY) throw new Error('Website forms are not configured: VITE_WEB3FORMS_ACCESS_KEY is not set.');
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: ACCESS_KEY, ...fields }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) throw new Error(result.message || `Request failed with status ${response.status}`);
}

/** True when a form's hidden spam-trap checkbox was ticked (people never see it). */
export function isBot(form: HTMLFormElement): boolean {
  return (form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked ?? false;
}
