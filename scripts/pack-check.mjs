#!/usr/bin/env node
// Pack the package, install the tarball into a clean consumer, import it,
// type-check against the shipped declarations and run the bin. Prints the
// tarball sha256 so receipts can name exact bytes.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const work = mkdtempSync(join(tmpdir(), 'framerize-pixel-pack-'));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });
try {
  run(npm, ['pack', '--pack-destination', work, '--ignore-scripts', '--loglevel=error'], root);
  const tgz = readdirSync(work).find((f) => f.endsWith('.tgz'));
  const sha = createHash('sha256').update(readFileSync(join(work, tgz))).digest('hex');
  const consumer = join(work, 'consumer');
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  const typesNode = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).devDependencies['@types/node'];
  run(npm, ['install', '--no-audit', '--no-fund', '--ignore-scripts', '--loglevel=error', join(work, tgz), `@types/node@${typesNode}`], consumer);
  writeFileSync(join(consumer, 'use.mjs'), readFileSync(join(root, 'scripts/pack-consumer.mjs')));
  const out = run(process.execPath, ['use.mjs'], consumer);
  writeFileSync(join(consumer, 'use.ts'), readFileSync(join(root, 'scripts/pack-consumer.ts')));
  writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext',
    strict: true, noEmit: true, skipLibCheck: false, types: ['node'] }, files: ['use.ts'] }));
  run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(consumer, 'tsconfig.json')], consumer);
  const bin = run(process.execPath, [join(consumer, 'node_modules/framerize-pixel/bin/framerize-pixel.js'), 'version', '--json'], consumer);
  const files = run('tar', ['tzf', join(work, tgz)]).trim().split('\n').sort();
  console.log(JSON.stringify({ tarball: tgz, sha256: sha, consumer: out.trim(), bin: JSON.parse(bin), files, node: process.version }, null, 2));
} finally {
  rmSync(work, { recursive: true, force: true });
}
