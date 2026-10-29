import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const copyDotfiles = {
  name: 'copy-dotfiles',
  closeBundle() {
    copyFileSync(
      path.resolve(__dirname, 'public/.htaccess'),
      path.resolve(__dirname, 'dist/.htaccess')
    );
  },
};

// The blog admin is its own page (admin.html), so Supabase and the editor
// never load on the public site. In dev, serve it for /admin and every
// sub-path, as .htaccess does in production.
const adminDevFallback: Plugin = {
  name: 'admin-dev-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/admin(\/[^.]*)?(\?.*)?$/.test(req.url)) req.url = '/admin.html';
      next();
    });
  },
};

// The website forms post to /api/send-form and /api/check-email, Vercel
// functions in production (api/*.ts). In dev, run the same handlers here.
const formApiDev: Plugin = {
  name: 'form-api-dev',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const route = req.url?.match(/^\/api\/(send-form|check-email)(?:\?|$)/)?.[1];
      if (!route) return next();
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
        const request = new Request(`http://localhost${req.url ?? ''}`, {
          method: req.method,
          headers,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        });
        const mod = await server.ssrLoadModule(`/api/${route}.ts`);
        const handler = req.method === 'POST' ? mod.POST : undefined;
        const response: Response = handler ? await handler(request) : new Response('Method not allowed', { status: 405 });
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (err) {
        console.error('form-api-dev:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: 'Dev form API failed' }));
      }
    });
  },
};

export default defineConfig(({ isSsrBuild, mode }) => {
  // Server-only secrets for the dev form API (never exposed: no VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['RESEND_API_KEY', 'RESEND_API_URL', 'FORM_TO_EMAIL', 'ABSTRACT_API_KEY', 'ABSTRACT_API_URL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    base: '/',
    plugins: [react(), tailwindcss(), copyDotfiles, adminDevFallback, formApiDev],
    resolve: {
      alias: {
        '@admin': path.resolve(__dirname, 'src/admin'),
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: isSsrBuild
      ? undefined
      : {
          rollupOptions: {
            input: {
              main: path.resolve(__dirname, 'index.html'),
              admin: path.resolve(__dirname, 'admin.html'),
            },
          },
        },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Serve index.html for all non-asset paths so React Router handles routing
      historyApiFallback: true,
    },
  };
});
