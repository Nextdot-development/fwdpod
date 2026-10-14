/**
 * Last build step: fail if anything served from dist/ contains a Supabase
 * secret. The browser may only ever hold the publishable (anon) key; the
 * secret / service-role key bypasses Row Level Security.
 *
 * Checks for: the literal SUPABASE_SECRET_KEY value (when set in the env),
 * any sb_secret_… key, and any JWT whose payload says role "service_role".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env.local', '.env']) dotenv.config({ path: path.join(root, file), quiet: true });

const distDir = path.join(root, process.argv[2] ?? 'dist');
const secret = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(html|js|css|json|txt|xml|webmanifest|map)$|^\.htaccess$/.test(entry.name)) yield full;
  }
}

function isServiceRoleJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

const problems = [];
for (const file of walk(distDir)) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (secret && text.includes(secret)) problems.push(`${rel}: contains SUPABASE_SECRET_KEY`);
  if (/sb_secret_[A-Za-z0-9_-]{16,}/.test(text)) problems.push(`${rel}: contains an sb_secret_ key`);
  for (const jwt of text.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g) ?? []) {
    if (isServiceRoleJwt(jwt)) problems.push(`${rel}: contains a service_role JWT`);
  }
}

if (problems.length) {
  console.error(`check-no-secrets: secret material in the build:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('check-no-secrets: no Supabase secret in dist/');
