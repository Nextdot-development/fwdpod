/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key for the booking form on /configure. Public by design; set per environment. */
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  /** Overrides the booking form endpoint, e.g. a local mock for testing. Defaults to Web3Forms. */
  readonly VITE_BOOKING_FORM_ENDPOINT?: string;
}
