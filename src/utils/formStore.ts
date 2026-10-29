/**
 * Sends a website form to /api/send-form, which checks every field and the
 * email address, then emails it to the inbox and saves it for the admin
 * (api/_store.ts). The browser never writes to Supabase itself, so the
 * server's checks can't be skipped.
 */
import { sendFormEmail, type FormKind } from './formEmail';

/** Spam-trap hits are dropped quietly: bots see success, nothing is sent. */
export async function deliverSubmission({
  form,
  email,
  bot,
}: {
  form: FormKind;
  email: Record<string, string | boolean>;
  bot: boolean;
}): Promise<void> {
  if (bot) return;
  await sendFormEmail(form, email);
}
