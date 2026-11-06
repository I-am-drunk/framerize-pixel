#!/usr/bin/env node
// npm tarballs drop the execute bit on node-pty's macOS spawn-helper, so
// posix_spawnp fails on macOS runners. Restore it before the PTY tests.
// No-op where the helper does not exist (Linux uses pty.node directly).
import { chmodSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const ptyDir = dirname(createRequire(import.meta.url).resolve('node-pty/package.json'));
const candidates = [`prebuilds/${process.platform}-${process.arch}/spawn-helper`, 'build/Release/spawn-helper'];
for (const rel of candidates) {
  const file = join(ptyDir, rel);
  if (!existsSync(file)) continue;
  const mode = statSync(file).mode & 0o777;
  if ((mode & 0o111) === 0) { chmodSync(file, mode | 0o755); console.log(`pty-prep: made ${rel} executable`); }
  else console.log(`pty-prep: ${rel} already executable`);
}
