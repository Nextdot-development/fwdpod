/**
 * The "Book a 30-minute call" form on /configure.
 *
 * Emails the Fwdpod inbox through /api/send-form (Resend) and saves the request
 * for the admin. The contact page has its own, shorter form (ContactForm) that
 * goes to the same inbox.
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { primaryButton } from './ui';
import { EMAIL_PATTERN, errorClass, formCard, hintClass, inputClass, labelClass } from './formStyles';
import { CONTACT_EMAIL, isBot } from '../../utils/formEmail';
import { deliverSubmission } from '../../utils/formStore';
import { EmailCheckHint, useEmailCheck } from './useEmailCheck';

const NEED_OPTIONS = ['Individual specialist', 'AI pod', 'Not sure yet'];
const ENGAGEMENT_OPTIONS = ['Hourly', 'Daily', 'Monthly', 'Not sure'];

export interface BookingValues {
  name: string;
  email: string;
  company: string;
  need: string;
  role_or_outcome: string;
  engagement: string;
  start_date: string;
  message: string;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'company' | 'need', string>>;

const EMPTY: BookingValues = {
  name: '',
  email: '',
  company: '',
  need: '',
  role_or_outcome: '',
  engagement: '',
  start_date: '',
  message: '',
};

function validate(values: BookingValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter a work email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address, like name@company.com.';
  if (!values.company.trim()) errors.company = 'Please enter your company name.';
  if (!values.need) errors.need = 'Please choose what you need.';
  return errors;
}

function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  required = false,
  error,
}: {
  name: keyof BookingValues;
  legend: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className={labelClass}>
        {legend}
        {required ? <span className="text-red-600"> *</span> : <span className="text-[#555555] font-normal"> (optional)</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(option => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#0066FF]/30 ${
                checked
                  ? 'border-[#0066FF] bg-[#0066FF]/5 font-medium text-[#0055DD]'
                  : `bg-white text-[#0A0A0A] hover:border-[#0A0A0A] ${error ? 'border-red-500' : 'border-zinc-300'}`
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                aria-invalid={Boolean(error) || undefined}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
      {error && <p id={`${name}-error`} className={errorClass}>{error}</p>}
    </fieldset>
  );
}

interface BookingFormProps {
  /** Page the form sits on, sent with the email, e.g. "/contact". */
  sourcePage: string;
  /** id of the heading that names the form, for aria-labelledby. */
  labelledBy: string;
  submitLabel: string;
  /** Extra line under the button (reply time, links). */
  note?: React.ReactNode;
  /** Body of the success panel; the form is replaced by it after sending. */
  renderSuccess: (sent: { firstName: string; email: string }) => React.ReactNode;
  /** Fires once per send attempt, for the page's analytics event. */
  onResult: (result: 'success' | 'error', values: BookingValues) => void;
}

export default function BookingForm({ sourcePage, labelledBy, submitLabel, note, renderSuccess, onResult }: BookingFormProps) {
  const [values, setValues] = useState<BookingValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof BookingValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const errors = validate(values);
  // Show a field's error once the visitor has left it, or after a submit attempt
  const errorFor = (field: keyof FieldErrors) => (touched[field] || submitAttempted ? errors[field] : undefined);

  const emailCheck = useEmailCheck();
  const emailResult = emailCheck.resultFor(values.email);
  const emailError = errorFor('email') || (emailResult && !emailResult.valid ? emailResult.message : undefined);
  const set = (field: keyof BookingValues) => (value: string) => setValues(prev => ({ ...prev, [field]: value }));
  const onText = (field: keyof BookingValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field)(e.target.value);
  const onBlur = (field: keyof BookingValues) => () => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) {
      // Move focus to the first field that needs fixing
      const first = (['name', 'email', 'company', 'need'] as const).find(f => errors[f]);
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
        form: 'booking',
        bot: botcheck,
        email: {
          botcheck,
          source_page: sourcePage,
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          need: values.need,
          // Optional fields go as entered; the server writes "Not given" for blanks
          role_or_outcome: values.role_or_outcome.trim(),
          engagement: values.engagement,
          start_date: values.start_date,
          message: values.message.trim(),
        },
        // Shown in the admin under Bookings
        table: 'booking_requests',
        row: {
          source_page: sourcePage,
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          need: values.need,
          role_or_outcome: values.role_or_outcome.trim() || null,
          engagement: values.engagement || null,
          start_date: values.start_date || null,
          message: values.message.trim() || null,
        },
      });
      onResult('success', values);
      setStatus('success');
    } catch (err) {
      console.error('Booking request failed:', err);
      onResult('error', values);
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
          Send another request
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
            We couldn't send your request. Your answers are still here: please try again, or email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="booking-name" className={labelClass}>Name <span className="text-red-600">*</span></label>
          <input
            id="booking-name" name="name" type="text" autoComplete="name"
            value={values.name} onChange={onText('name')} onBlur={onBlur('name')}
            aria-invalid={Boolean(errorFor('name')) || undefined}
            aria-describedby={errorFor('name') ? 'booking-name-error' : undefined}
            className={inputClass(Boolean(errorFor('name')))}
          />
          {errorFor('name') && <p id="booking-name-error" className={errorClass}>{errorFor('name')}</p>}
        </div>
        <div>
          <label htmlFor="booking-email" className={labelClass}>Work email <span className="text-red-600">*</span></label>
          <input
            id="booking-email" name="email" type="email" autoComplete="email" inputMode="email"
            value={values.email} onChange={onText('email')} onBlur={() => { onBlur('email')(); emailCheck.check(values.email); }}
            aria-invalid={Boolean(emailError) || undefined}
            aria-describedby={emailError ? 'booking-email-error' : undefined}
            className={inputClass(Boolean(emailError))}
          />
          {emailError && <p id="booking-email-error" className={errorClass}>{emailError}</p>}
          <EmailCheckHint
            checking={emailCheck.checking}
            result={emailResult}
            onUseSuggestion={email => { setValues(prev => ({ ...prev, email })); emailCheck.check(email); }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="booking-company" className={labelClass}>Company <span className="text-red-600">*</span></label>
        <input
          id="booking-company" name="company" type="text" autoComplete="organization"
          value={values.company} onChange={onText('company')} onBlur={onBlur('company')}
          aria-invalid={Boolean(errorFor('company')) || undefined}
          aria-describedby={errorFor('company') ? 'booking-company-error' : undefined}
          className={inputClass(Boolean(errorFor('company')))}
        />
        {errorFor('company') && <p id="booking-company-error" className={errorClass}>{errorFor('company')}</p>}
      </div>

      <ChoiceGroup
        name="need" legend="What do you need?" options={NEED_OPTIONS} required
        value={values.need} onChange={v => { set('need')(v); setTouched(prev => ({ ...prev, need: true })); }}
        error={errorFor('need')}
      />

      <div>
        <label htmlFor="booking-role" className={labelClass}>
          Role or outcome <span className="text-[#555555] font-normal">(optional)</span>
        </label>
        <input
          id="booking-role" name="role_or_outcome" type="text" maxLength={200}
          placeholder="e.g. Two RAG engineers, or a voice agent for patient intake"
          value={values.role_or_outcome} onChange={onText('role_or_outcome')}
          className={inputClass(false)}
        />
      </div>

      <ChoiceGroup
        name="engagement" legend="Preferred engagement" options={ENGAGEMENT_OPTIONS}
        value={values.engagement} onChange={set('engagement')}
      />

      <div>
        <label htmlFor="booking-start" className={labelClass}>
          Ideal start date <span className="text-[#555555] font-normal">(optional)</span>
        </label>
        <input
          id="booking-start" name="start_date" type="date"
          value={values.start_date} onChange={onText('start_date')}
          className={`${inputClass(false)} sm:max-w-xs`}
        />
      </div>

      <div>
        <label htmlFor="booking-message" className={labelClass}>
          Anything else <span className="text-[#555555] font-normal">(optional)</span>
        </label>
        <textarea
          id="booking-message" name="message" rows={4} maxLength={2000}
          value={values.message} onChange={onText('message')}
          className={`${inputClass(false)} resize-y`}
        />
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
            submitLabel
          )}
        </button>
        <p className={hintClass}>
          <span className="text-red-600">*</span> Required. We only use your details to reply to this request.
          {note && <> {note}</>}
        </p>
      </div>
    </form>
  );
}
