/**
 * The build step's behaviour when Supabase is unreachable (acceptance test 5)
 * and when the wrong key is configured.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(import.meta.dirname, '..');
const outFile = path.join(root, 'content', 'cms', 'posts.json');

function run(env: Record<string, string>) {
  // Run from a temp copy of the env so the project's .env cannot interfere.
  return spawnSync(process.execPath, ['--import', 'tsx', path.join(root, 'scripts', 'fetch-cms-posts.ts')], {
    cwd: root,
    env: { PATH: process.env.PATH ?? '', SystemRoot: process.env.SystemRoot ?? '', HOME: os.tmpdir(), ...env },
    encoding: 'utf8',
  });
}

function withSavedOutput(fn: () => void) {
  const saved = fs.existsSync(outFile) ? fs.readFileSync(outFile) : null;
  try {
    fn();
  } finally {
    if (saved) fs.writeFileSync(outFile, saved);
    else fs.rmSync(outFile, { force: true });
  }
}

const unreachable = {
  VITE_SUPABASE_URL: 'http://127.0.0.1:9',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
};

test('locally, an unreachable database still builds the site (markdown posts only)', () => {
  withSavedOutput(() => {
    const r = run(unreachable);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(outFile, 'utf8')), []);
  });
});

test('in CI (CMS_REQUIRED=1) an unreachable database stops the deploy, so the live site keeps its last build', () => {
  withSavedOutput(() => {
    const r = run({ ...unreachable, CMS_REQUIRED: '1' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /could not reach Supabase/);
  });
});

test('a secret key in the publishable slot is refused', () => {
  withSavedOutput(() => {
    const r = run({ ...unreachable, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abcdefghijklmnopqrstuvwxyz' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /secret\/service-role key/);
  });
});

test('CMS_ENABLED=false skips Supabase entirely', () => {
  withSavedOutput(() => {
    const r = run({ ...unreachable, CMS_ENABLED: 'false', CMS_REQUIRED: '1' });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(fs.readFileSync(outFile, 'utf8')), []);
  });
});
