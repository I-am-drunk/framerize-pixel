#!/usr/bin/env node
// framerize-pixel CLI: showcase, interactive demo, version. Styling only; no network.
import { createOutput, createTheme, showcase, VERSION } from '../dist/index.js';

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('--')) ?? 'showcase';
const mode = args.includes('--json') ? 'json' : args.includes('--plain') ? 'plain' : 'human';
const ascii = args.includes('--ascii');
const palette = args.includes('--phosphor') ? 'phosphor' : 'crt';
const widthArg = args.find((a) => a.startsWith('--width='));
const columns = widthArg === undefined ? undefined : Number(widthArg.slice(8));

const out = createOutput({ mode });
if (command === 'version' || args.includes('--version')) {
  out.say(VERSION, { always: mode !== 'json' });
  out.json({ name: 'framerize-pixel', version: VERSION });
} else if (command === 'showcase') {
  const { crt, phosphor } = await import('../dist/index.js');
  const theme = createTheme({ mode, ascii, palette: palette === 'phosphor' ? phosphor : crt,
    ...(Number.isFinite(columns) && columns > 0 ? { columns } : {}) });
  out.say(showcase(theme));
  out.json({ name: 'framerize-pixel', version: VERSION, showcase: 'suppressed in json mode' });
} else if (command === 'demo') {
  const { runDemo } = await import('../dist/demo.js');
  process.exitCode = await runDemo({ mode, ascii });
} else {
  out.note(`unknown command: ${command}`);
  out.note('usage: framerize-pixel [showcase|demo|version] [--json|--plain] [--ascii] [--phosphor] [--width=N]');
  process.exitCode = 2;
}
