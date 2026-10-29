/**
 * Checks a form's email address with the server (format, mail server,
 * throwaway inbox) when the visitor leaves the field and again on submit.
 * Shared by the booking and contact forms.
 */
import React, { useCallback, useState } from 'react';
import { EMAIL_PATTERN } from './formStyles';
import { checkEmailAddress, type EmailCheck } from '../../utils/formEmail';

export function useEmailCheck() {
  const [result, setResult] = useState<{ email: string; check: EmailCheck } | null>(null);
  const [checking, setChecking] = useState(false);

  /** Runs the check (or reuses the last result for the same address). Null means it couldn't run. */
  const check = useCallback(
    async (raw: string): Promise<EmailCheck | null> => {
      const email = raw.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) return null;
      if (result?.email === email) return result.check;
      setChecking(true);
      const outcome = await checkEmailAddress(email);
      setChecking(false);
      if (outcome) setResult({ email, check: outcome });
      return outcome;
    },
    [result]
  );

  /** The finished check for this exact address, if there is one. */
  const resultFor = (raw: string) => (result && result.email === raw.trim().toLowerCase() ? result.check : null);

  return { check, resultFor, checking };
}

/** "Checking…" while it runs, and a one-click fix for a likely typo. */
export function EmailCheckHint({
  checking,
  result,
  onUseSuggestion,
}: {
  checking: boolean;
  result: EmailCheck | null;
  onUseSuggestion: (email: string) => void;
}) {
  if (checking) return <p className="mt-1.5 text-xs text-[#555555]" aria-live="polite">Checking email…</p>;
  if (!result?.suggestion) return null;
  return (
    <p className="mt-1.5 text-xs text-[#555555]" aria-live="polite">
      Did you mean{' '}
      <button type="button" onClick={() => onUseSuggestion(result.suggestion!)} className="font-medium text-[#0066FF] underline hover:text-[#0055DD]">
        {result.suggestion}
      </button>
      ?
    </p>
  );
}
