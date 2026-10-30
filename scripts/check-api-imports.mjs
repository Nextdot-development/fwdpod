/**
 * Loads every Vercel function the way Vercel runs it: each api/*.ts compiled
 * on its own to an ES module (package.json has "type": "module"), then
 * imported by plain Node. Node needs file extensions on relative imports, so
 * `from './_email'` fails here exactly as it does on Vercel, while Vite and
 * tsx resolve it locally and hide the problem.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'api-check-'));
fs.writeFileSync(path.join(out, 'package.json'), '{"type":"module"}');

const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  const { code } = transformSync(fs.readFileSync(path.join(apiDir, file), 'utf8'), { loader: 'ts', format: 'esm' });
  fs.writeFileSync(path.join(out, file.replace(/\.ts$/, '.js')), code);
}

const problems = [];
for (const file of files.filter(f => !f.startsWith('_'))) {
  try {
    const mod = await import(pathToFileURL(path.join(out, file.replace(/\.ts$/, '.js'))).href);
    if (typeof mod.POST !== 'function') problems.push(`api/${file}: no POST export`);
  } catch (err) {
    problems.push(`api/${file}: ${err.message.split('\n')[0]}`);
  }
}
fs.rmSync(out, { recursive: true, force: true });

if (problems.length) {
  console.error(`check-api-imports: these functions would crash on Vercel:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-api-imports: ${files.filter(f => !f.startsWith('_')).length} API functions load as Vercel runs them`);
