import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import App from './App.tsx';
import { RenderStatusContext, type RenderStatus } from './ssr/renderStatus';

export { getPostRedirects, getPrerenderRoutes } from './ssr/routes';
export { SITE_BASE_URL } from './components/SEO';

export interface RenderResult {
  /** Hoisted <title>, <meta> and <link> tags for <head>. */
  head: string;
  /** Markup for inside <div id="root">. */
  appHtml: string;
  /** True when the URL matched no route and rendered the not-found page. */
  notFound: boolean;
}

const ROOT_OPEN = '<div id="root">';
const DOC_CLOSE = '</div></body></html>';

export function render(url: string): RenderResult {
  const status: RenderStatus = { notFound: false };

  // Render a whole document so React 19 hoists per-page metadata into <head>;
  // a partial render would emit those tags inline ahead of the app markup.
  const doc = renderToString(
    <html>
      <head />
      <body>
        <div id="root">
          <StrictMode>
            <RenderStatusContext.Provider value={status}>
              <HelmetProvider>
                <StaticRouter location={url}>
                  <App />
                </StaticRouter>
              </HelmetProvider>
            </RenderStatusContext.Provider>
          </StrictMode>
        </div>
      </body>
    </html>,
  );

  const headStart = doc.indexOf('<head>');
  const headEnd = doc.indexOf('</head>');
  const rootStart = doc.indexOf(ROOT_OPEN);
  const rootEnd = doc.lastIndexOf(DOC_CLOSE);
  if (headStart === -1 || headEnd === -1 || rootStart === -1 || rootEnd < rootStart) {
    throw new Error(`Unexpected server render output for ${url}`);
  }

  return {
    head: doc.slice(headStart + '<head>'.length, headEnd),
    appHtml: doc.slice(rootStart + ROOT_OPEN.length, rootEnd),
    notFound: status.notFound,
  };
}
