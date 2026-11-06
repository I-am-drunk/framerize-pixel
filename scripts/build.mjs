#!/usr/bin/env node
// Deterministic build: tsc emit plus a build-info file derived only from
// source bytes. SOURCE_DATE_EPOCH, when set, is recorded instead of now.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}

function sourceHash() {
  const hash = createHash('sha256');
  for (const file of [...walk(join(root, 'src')), join(root, 'package.json'), join(root, 'package-lock.json')]) {
    hash.update(relative(root, file).split(sep).join('/')).update('\0').update(readFileSync(file)).update('\0');
  }
  return hash.digest('hex');
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(root, 'tsconfig.json')], { stdio: 'inherit' });
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const info = { name: pkg.name, version: pkg.version, sourceSha256: sourceHash(),
  sourceDateEpoch: process.env.SOURCE_DATE_EPOCH ?? null, node: process.version.split('.')[0] };
writeFileSync(join(dist, 'build-info.json'), JSON.stringify(info, null, 2) + '\n');
console.log(`built ${pkg.name}@${pkg.version} source ${info.sourceSha256.slice(0, 16)}`);
