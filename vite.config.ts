import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

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

export default defineConfig(({ isSsrBuild }) => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), copyDotfiles, adminDevFallback],
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
