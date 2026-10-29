/** Shared look for the website's forms (booking on /configure, contact on /contact). */
export const labelClass = 'block text-sm font-medium text-[#0A0A0A]';
export const hintClass = 'text-xs text-[#555555]';
export const errorClass = 'mt-1.5 text-xs text-red-600';
export const formCard = 'rounded-3xl border border-zinc-200/85 bg-white shadow-sm p-6 md:p-8 space-y-6';

export const inputClass = (invalid: boolean) =>
  `mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 ${
    invalid ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-[#0066FF]'
  }`;

// Same rule as the server's check (api/_email.ts): a plain local part, then
// dot-separated domain labels and a letter TLD.
export const EMAIL_PATTERN = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export const EMAIL_REQUIRED = 'Please enter your work email address.';
export const EMAIL_INVALID = 'Please enter a valid email address.';
