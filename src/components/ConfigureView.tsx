import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SEO from './SEO';
import { Link } from 'react-router-dom';
import { primaryButton } from './marketing/ui';
import { EMAIL_PATTERN, errorClass, formCard, hintClass, inputClass, labelClass } from './marketing/formStyles';
import { CONTACT_EMAIL, isBot, sendToInbox } from '../utils/web3forms';
import { trackBookingRequest } from '../utils/analytics';
import { SHORTLIST_TIME } from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Book a 30-Minute Call | Fwdpod';
const PAGE_DESCRIPTION = `Tell us the role or the outcome you need. We'll send matched profiles of pre-vetted AI engineers, or a pod plan, within ${SHORTLIST_TIME}.`;

const CONFIGURE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.fwdpod.com/#configure',
  'url': 'https://www.fwdpod.com/configure',
  'name': PAGE_TITLE,
  'description': PAGE_DESCRIPTION,
  'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Book a 30-minute call', 'item': 'https://www.fwdpod.com/configure' }
    ]
  }
};

const NEED_OPTIONS = ['Individual specialist', 'AI pod', 'Not sure yet'];
const ENGAGEMENT_OPTIONS = ['Hourly', 'Daily', 'Monthly', 'Not sure'];

interface FormValues {
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

const EMPTY: FormValues = {
  name: '',
  email: '',
  company: '',
  need: '',
  role_or_outcome: '',
  engagement: '',
  start_date: '',
  message: '',
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your work email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
  if (!values.company.trim()) errors.company = 'Enter your company name.';
  if (!values.need) errors.need = 'Choose what you need.';
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
  name: keyof FormValues;
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

interface ConfigureViewProps {
  /** Kept for App's route wiring; the old configurator pre-selected a pod from it. */
  initialPodId: string | null;
  onClearPodSelection: () => void;
}

export default function ConfigureView(_props: ConfigureViewProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const errors = validate(values);
  // Show a field's error once the visitor has left it, or after a submit attempt
  const errorFor = (field: keyof FieldErrors) => (touched[field] || submitAttempted ? errors[field] : undefined);

  const set = (field: keyof FormValues) => (value: string) => setValues(prev => ({ ...prev, [field]: value }));
  const onText = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field)(e.target.value);
  const onBlur = (field: keyof FormValues) => () => setTouched(prev => ({ ...prev, [field]: true }));

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

    setStatus('submitting');
    try {
      await sendToInbox({
          subject: `Booking request: ${values.company.trim()} (${values.need})`,
          from_name: 'fwdpod.com booking form',
          replyto: values.email.trim(),
          botcheck,
          source_page: '/configure',
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          need: values.need,
          role_or_outcome: values.role_or_outcome.trim() || 'Not given',
          engagement: values.engagement || 'Not given',
          start_date: values.start_date || 'Not given',
          message: values.message.trim() || 'Not given',
      });
      trackBookingRequest('success', values.need, values.engagement || 'Not given');
      setStatus('success');
    } catch (err) {
      console.error('Booking request failed:', err);
      trackBookingRequest('error', values.need, values.engagement || 'Not given');
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setSubmitAttempted(false);
    setStatus('idle');
  };

  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CONFIGURE_JSON_LD} />

      <div className="max-w-2xl mx-auto pt-2 pb-12 md:pb-16 space-y-8">
        {/* Intro */}
        <section className="space-y-3" aria-labelledby="booking-heading">
          <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Book a call</span>
          <h1 id="booking-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
            Book a 30-minute call
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Tell us the role or the outcome. We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
          </p>
        </section>

        {status === 'success' ? (
          <section
            role="status"
            aria-live="polite"
            className="rounded-3xl border border-[#0066FF]/30 bg-[#0066FF]/5 p-6 md:p-8 space-y-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#0066FF] shrink-0" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">
                  Thanks, {values.name.trim().split(' ')[0]}. Your request is in.
                </h2>
                <p className="text-sm text-[#555555] leading-relaxed">
                  We'll reply to <strong className="text-[#0A0A0A] font-medium">{values.email.trim()}</strong> to set up the call,
                  and send matched profiles or a pod plan within {SHORTLIST_TIME}.
                </p>
              </div>
            </div>
            <button type="button" onClick={reset} className="text-sm font-medium text-[#0066FF] hover:underline">
              Send another request
            </button>
          </section>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-labelledby="booking-heading"
            className={formCard}
          >
            {status === 'error' && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700 leading-relaxed">
                  We couldn't send your request. Please try again, or email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
                  Your answers are still here.
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
                  value={values.email} onChange={onText('email')} onBlur={onBlur('email')}
                  aria-invalid={Boolean(errorFor('email')) || undefined}
                  aria-describedby={errorFor('email') ? 'booking-email-error' : undefined}
                  className={inputClass(Boolean(errorFor('email')))}
                />
                {errorFor('email') && <p id="booking-email-error" className={errorClass}>{errorFor('email')}</p>}
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
                ) : (
                  'Send request'
                )}
              </button>
              <p className={hintClass}>
                <span className="text-red-600">*</span> Required. We only use your details to reply to this request.
                {' '}A general question instead? <Link to="/contact" className="text-[#0066FF] underline hover:text-[#0055DD]">Contact us</Link>.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
