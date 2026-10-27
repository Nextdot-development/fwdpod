/**
 * Emails a website form to the Fwdpod inbox through our own /api/send-form
 * function (api/send-form.ts), which sends it with Resend from an
 * @fwdpod.com address. The Resend key lives only on the server.
 *
 * Throws on any failure, so the form can show its error state instead of a
 * false success.
 */
export const CONTACT_EMAIL = 'contact.fwdpod@gmail.com';

export type FormKind = 'booking' | 'contact';

export async function sendFormEmail(form: FormKind, fields: Record<string, string | boolean>): Promise<void> {
  const response = await fetch('/api/send-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ form, ...fields }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error || `Request failed with status ${response.status}`);
}

/** True when a form's hidden spam-trap checkbox was ticked (people never see it). */
export function isBot(form: HTMLFormElement): boolean {
  return (form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked ?? false;
}
