/**
 * The contact form on /contact: name, work email, company and a message.
 *
 * Separate from the booking form on /configure, but goes to the same inbox
 * (through /api/send-form, Resend), with its own subject ("Contact message: ...")
 * and sender so the two are easy to tell apart.
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { primaryButton } from './ui';
import { EMAIL_PATTERN, errorClass, formCard, hintClass, inputClass, labelClass } from './formStyles';
import { CONTACT_EMAIL, isBot } from '../../utils/formEmail';
import { deliverSubmission } from '../../utils/formStore';
import { EmailCheckHint, useEmailCheck } from './useEmailCheck';

interface ContactValues {
  name: string;
  email: string;
  company: string;
  message: string;
}

type FieldErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = { name: '', email: '', company: '', message: '' };

function validate(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter a work email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address, like name@company.com.';
  if (!values.company.trim()) errors.company = 'Please enter your company name.';
  if (!values.message.trim()) errors.message = 'Please write a short message.';
  return errors;
}

interface ContactFormProps {
  /** id of the heading that names the form, for aria-labelledby. */
  labelledBy: string;
  /** Extra line under the button, e.g. the reply time. */
  note?: React.ReactNode;
  /** Body of the success panel; the form is replaced by it after sending. */
  renderSuccess: (sent: { firstName: string; email: string }) => React.ReactNode;
  /** Fires once per send attempt, for the page's analytics event. */
  onResult: (result: 'success' | 'error') => void;
}

export default function ContactForm({ labelledBy, note, renderSuccess, onResult }: ContactFormProps) {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const errors = validate(values);
  // Show a field's error once the visitor has left it, or after a submit attempt
  const errorFor = (field: keyof ContactValues) => (touched[field] || submitAttempted ? errors[field] : undefined);
  const emailCheck = useEmailCheck();
  const emailResult = emailCheck.resultFor(values.email);
  const emailError = errorFor('email') || (emailResult && !emailResult.valid ? emailResult.message : undefined);
  const onText = (field: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  const onBlur = (field: keyof ContactValues) => () => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) {
      // Move focus to the first field that needs fixing
      const first = (['name', 'email', 'company', 'message'] as const).find(f => errors[f]);
      if (first) e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const botcheck = isBot(e.currentTarget);
    const form = e.currentTarget;
    setStatus('submitting');
    const verdict = await emailCheck.check(values.email);
    if (verdict && !verdict.valid) {
      setStatus('idle');
      form.querySelector<HTMLElement>('[name="email"]')?.focus();
      return;
    }
    try {
      await deliverSubmission({
        form: 'contact',
        bot: botcheck,
        email: {
          botcheck,
          source_page: '/contact',
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          message: values.message.trim(),
        },
        // Shown in the admin under Contact messages
        table: 'contact_messages',
        row: {
          source_page: '/contact',
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          message: values.message.trim(),
        },
      });
      onResult('success');
      setStatus('success');
    } catch (err) {
      console.error('Contact message failed:', err);
      onResult('error');
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setSubmitAttempted(false);
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <section role="status" aria-live="polite" className="rounded-3xl border border-[#0066FF]/30 bg-[#0066FF]/5 p-6 md:p-8 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#0066FF] shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            {renderSuccess({ firstName: values.name.trim().split(' ')[0], email: values.email.trim() })}
          </div>
        </div>
        <button type="button" onClick={reset} className="text-sm font-medium text-[#0066FF] hover:underline">
          Send another message
        </button>
      </section>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-labelledby={labelledBy} className={formCard}>
      {status === 'error' && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 leading-relaxed">
            We couldn't send your message. Your message is still here: please try again, or email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Name <span className="text-red-600">*</span></label>
          <input
            id="contact-name" name="name" type="text" autoComplete="name"
            value={values.name} onChange={onText('name')} onBlur={onBlur('name')}
            aria-invalid={Boolean(errorFor('name')) || undefined}
            aria-describedby={errorFor('name') ? 'contact-name-error' : undefined}
            className={inputClass(Boolean(errorFor('name')))}
          />
          {errorFor('name') && <p id="contact-name-error" className={errorClass}>{errorFor('name')}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Work email <span className="text-red-600">*</span></label>
          <input
            id="contact-email" name="email" type="email" autoComplete="email" inputMode="email"
            value={values.email} onChange={onText('email')} onBlur={() => { onBlur('email')(); emailCheck.check(values.email); }}
            aria-invalid={Boolean(emailError) || undefined}
            aria-describedby={emailError ? 'contact-email-error' : undefined}
            className={inputClass(Boolean(emailError))}
          />
          {emailError && <p id="contact-email-error" className={errorClass}>{emailError}</p>}
          <EmailCheckHint
            checking={emailCheck.checking}
            result={emailResult}
            onUseSuggestion={email => { setValues(prev => ({ ...prev, email })); emailCheck.check(email); }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-company" className={labelClass}>Company <span className="text-red-600">*</span></label>
        <input
          id="contact-company" name="company" type="text" autoComplete="organization"
          value={values.company} onChange={onText('company')} onBlur={onBlur('company')}
          aria-invalid={Boolean(errorFor('company')) || undefined}
          aria-describedby={errorFor('company') ? 'contact-company-error' : undefined}
          className={inputClass(Boolean(errorFor('company')))}
        />
        {errorFor('company') && <p id="contact-company-error" className={errorClass}>{errorFor('company')}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>Message <span className="text-red-600">*</span></label>
        <textarea
          id="contact-message" name="message" rows={5} maxLength={3000}
          value={values.message} onChange={onText('message')} onBlur={onBlur('message')}
          aria-invalid={Boolean(errorFor('message')) || undefined}
          aria-describedby={errorFor('message') ? 'contact-message-error' : undefined}
          className={`${inputClass(Boolean(errorFor('message')))} resize-y`}
        />
        {errorFor('message') && <p id="contact-message-error" className={errorClass}>{errorFor('message')}</p>}
      </div>

      {/* Spam trap, hidden from people and screen readers */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="pt-2 space-y-3">
        <button type="submit" disabled={status === 'submitting'} className={`${primaryButton} w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait`}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Sending…</span>
            </>
          ) : status === 'error' ? (
            'Try again'
          ) : (
            'Send message'
          )}
        </button>
        <p className={hintClass}>
          <span className="text-red-600">*</span> Required. We only use your details to reply to you.
          {note && <> {note}</>}
        </p>
      </div>
    </form>
  );
}
