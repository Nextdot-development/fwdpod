// GA4 Measurement ID — single source of truth
const GA_ID = 'G-5K3V0MS7WM';

// Safe wrapper: no-ops until gtag.js has loaded
function gtag(...args: unknown[]): void {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag(...args);
  }
}

// ── Page view (fire on every SPA route change) ────────────────────────────────
export function trackPageView(pathname: string, search = ''): void {
  gtag('config', GA_ID, { page_path: pathname + search });
}

// ── Generic event (use for custom events not covered by named helpers) ────────
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  gtag('event', name, params);
}

// ── Named helpers ─────────────────────────────────────────────────────────────

// CTA buttons — "Configure pod", "Configure Your Pod", spec sheet CTA, etc.
export function trackCtaClick(label: string, destination?: string): void {
  trackEvent('cta_click', { event_category: 'engagement', event_label: label, destination });
}

// Top-nav and footer navigation link clicks
export function trackNavClick(label: string, destination: string): void {
  trackEvent('navigation_click', { event_category: 'navigation', event_label: label, destination });
}

// Contact form successful submission
export function trackContactFormSubmit(podArchetype: string): void {
  trackEvent('contact_form_submit', {
    event_category: 'conversion',
    event_label: 'contact_form',
    pod_archetype: podArchetype,
  });
}

// Blog search — fire after debounce when query >= 2 chars
export function trackSearchPerformed(query: string, resultsCount: number): void {
  trackEvent('search', { search_term: query, results_count: resultsCount });
}

// Blog article opened in detail view
export function trackBlogPostView(title: string, category: string): void {
  trackEvent('blog_post_view', {
    event_category: 'content',
    post_title: title,
    post_category: category,
  });
}

// Blog category filter pill selected
export function trackBlogCategoryFilter(categoryName: string): void {
  trackEvent('blog_category_filter', { event_category: 'content', category_name: categoryName });
}

// External / outbound link clicks
export function trackExternalLinkClick(url: string, label?: string): void {
  trackEvent('outbound_click', { event_category: 'engagement', event_label: label ?? url, url });
}

// Manifesto modal interactions
export function trackManifestoEvent(action: 'open' | 'download' | 'close'): void {
  trackEvent('manifesto_interaction', { event_category: 'engagement', action });
}

// Pod spec sheet interactions
export function trackPodSpecView(podId: string, action: 'open' | 'configure'): void {
  trackEvent('pod_spec_interaction', { event_category: 'engagement', pod_id: podId, action });
}
