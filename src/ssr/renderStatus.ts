import { createContext } from 'react';

/**
 * Mutable flags a server render reports back to scripts/prerender.mjs.
 * Only provided during prerendering — in the browser the context is null.
 */
export interface RenderStatus {
  notFound: boolean;
}

export const RenderStatusContext = createContext<RenderStatus | null>(null);
