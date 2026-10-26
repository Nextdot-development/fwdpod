import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import SEO from './SEO';
import { cardHover, primaryButton } from './marketing/ui';
import { EMAIL_PATTERN, errorClass, formCard, hintClass, inputClass, labelClass } from './marketing/formStyles';
import { CONTACT_EMAIL, isBot, sendToInbox } from '../utils/web3forms';
import { trackContactFormSubmit } from '../utils/analytics';
import { SHORTLIST_TIME } from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Contact Fwdpod | AI Engineers and AI Pods from India';
const PAGE_DESCRIPTION =
  'Questions about AI engineers, AI pods or how we work? Send us a message or email contact.fwdpod@gmail.com. To scope a project, book a 30-minute call.';

const CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['WebPage', 'ContactPage'],
      '@id': 'https://www.fwdpod.com/#contact',
      'url': 'https://www.fwdpod.com/contact',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'about': { '@id': 'https://www.fwdpod.com/#organization' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contact', 'item': 'https://www.fwdpod.com/contact' }
        ]
      }
    },
    {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': CONTACT_EMAIL,
      'areaServed': 'Worldwide',
      'availableLanguage': ['English']
    }
  ]
};

interface FormValues {
  name: string;
  email: string;
  company: string;
  message: string;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

const EMPTY: FormValues = { name: '', email: '', company: '', message: '' };

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
  if (!values.message.trim()) errors.message = 'Write a short message.';
  return errors;
}

interface ContactViewProps {
  /** Kept for App's route wiring; not used by this page. */
  onNavigate: (pageName: string, preselectedPodId?: string) => void;
  triggerNotification?: (msg: string) => void;
}

export default function ContactView(_props: ContactViewProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const errors = validate(values);
  // Show a field's error once the visitor has left it, or after a submit attempt
  const errorFor = (field: keyof FieldErrors) => (touched[field] || submitAttempted ? errors[field] : undefined);
  const onText = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  const onBlur = (field: keyof FormValues) => () => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) {
      const first = (['name', 'email', 'message'] as const).find(f => errors[f]);
      if (first) e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const botcheck = isBot(e.currentTarget);
    setStatus('submitting');
    try {
      await sendToInbox({
        subject: `Website message: ${values.name.trim()}${values.company.trim() ? ` (${values.company.trim()})` : ''}`,
        from_name: 'fwdpod.com contact form',
        replyto: values.email.trim(),
        botcheck,
        source_page: '/contact',
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim() || 'Not given',
        message: values.message.trim(),
      });
      trackContactFormSubmit('success');
      setStatus('success');
    } catch (err) {
      console.error('Contact message failed:', err);
      trackContactFormSubmit('error');
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
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CONTACT_JSON_LD} />

      {/* Intro */}
      <section className="pt-2 space-y-3 max-w-3xl" aria-labelledby="contact-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Contact</span>
        <h1 id="contact-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          Contact us
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          Questions about our engineers, pods or how we work? Send us a message and we'll reply by email.
        </p>
      </section>

      <div className="pt-8 pb-12 md:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Message form */}
        <div className="lg:col-span-7">
          {status === 'success' ? (
            <section role="status" aria-live="polite" className="rounded-3xl border border-[#0066FF]/30 bg-[#0066FF]/5 p-6 md:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#0066FF] shrink-0" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">
                    Thanks, {values.name.trim().split(' ')[0]}. Your message is in.
                  </h2>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    We'll reply to <strong className="text-[#0A0A0A] font-medium">{values.email.trim()}</strong>.
                  </p>
                </div>
              </div>
              <button type="button" onClick={reset} className="text-sm font-medium text-[#0066FF] hover:underline">
                Send another message
              </button>
            </section>
          ) : (
            <form noValidate onSubmit={handleSubmit} aria-labelledby="contact-form-heading" className={formCard}>
              <h2 id="contact-form-heading" className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">
                Send a message
              </h2>

              {status === 'error' && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-700 leading-relaxed">
                    We couldn't send your message. Please try again, or email us at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
                    Your message is still here.
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
                  <label htmlFor="contact-email" className={labelClass}>Email <span className="text-red-600">*</span></label>
                  <input
                    id="contact-email" name="email" type="email" autoComplete="email" inputMode="email"
                    value={values.email} onChange={onText('email')} onBlur={onBlur('email')}
                    aria-invalid={Boolean(errorFor('email')) || undefined}
                    aria-describedby={errorFor('email') ? 'contact-email-error' : undefined}
                    className={inputClass(Boolean(errorFor('email')))}
                  />
                  {errorFor('email') && <p id="contact-email-error" className={errorClass}>{errorFor('email')}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="contact-company" className={labelClass}>
                  Company <span className="text-[#555555] font-normal">(optional)</span>
                </label>
                <input
                  id="contact-company" name="company" type="text" autoComplete="organization"
                  value={values.company} onChange={onText('company')}
                  className={inputClass(false)}
                />
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
                  ) : (
                    'Send message'
                  )}
                </button>
                <p className={hintClass}>
                  <span className="text-red-600">*</span> Required. We only use your details to reply to you.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Other ways to reach us */}
        <aside className="lg:col-span-5 space-y-6" aria-label="Other ways to reach us">
          <div className={`rounded-3xl border border-zinc-200/85 bg-white p-6 md:p-8 space-y-3 ${cardHover}`}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066FF] block">Email</span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-base font-medium text-[#0A0A0A] hover:text-[#0066FF] break-all">
              <Mail className="w-4 h-4 shrink-0 text-[#0066FF]" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className={`rounded-3xl border border-zinc-200/85 bg-white p-6 md:p-8 space-y-3 ${cardHover}`}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066FF] block">Planning a project?</span>
            <h2 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">Book a 30-minute call</h2>
            <p className="text-sm text-[#555555] leading-relaxed">
              Tell us the role or the outcome. We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
            </p>
            <Link to="/configure" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0066FF] hover:underline">
              Book a call <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
