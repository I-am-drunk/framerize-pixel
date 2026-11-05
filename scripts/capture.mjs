#!/usr/bin/env node
// Deterministic captures of the showcase at several widths and color modes.
// Human captures keep escapes (.ansi); plain captures are text (.txt).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTheme, phosphor, plainTheme, showcase, unicode } from '../dist/index.js';

const dir = new URL('../captures/', import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const tty = { isTTY: true };
const cases = [
  ['plain-ascii-40.txt', plainTheme(40)],
  ['plain-ascii-80.txt', plainTheme(80)],
  ['plain-unicode-60.txt', createTheme({ env: { TERM: 'xterm-256color', LANG: 'en_US.UTF-8' }, argv: [], platform: 'linux', mode: 'plain', columns: 60 })],
  ['color16-unicode-40.ansi', createTheme({ env: { TERM: 'xterm', LANG: 'C.UTF-8' }, argv: [], platform: 'linux', columns: 40, stream: tty })],
  ['color256-unicode-80.ansi', createTheme({ env: { TERM: 'xterm-256color', LANG: 'C.UTF-8' }, argv: [], platform: 'linux', columns: 80, stream: tty })],
  ['truecolor-unicode-100.ansi', createTheme({ env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, argv: [], platform: 'linux', columns: 100, stream: tty })],
  ['truecolor-phosphor-80.ansi', createTheme({ env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, argv: [], platform: 'linux', columns: 80, stream: tty, palette: phosphor })],
  ['nocolor-unicode-20.txt', createTheme({ env: { NO_COLOR: '1', TERM: 'xterm-256color' }, argv: [], platform: 'linux', columns: 20, stream: tty })],
  ['dumb-unicode-80.txt', createTheme({ env: { TERM: 'dumb' }, argv: [], platform: 'linux', columns: 80, stream: tty })],
];
const index = [];
for (const [name, theme] of cases) {
  const text = showcase(theme) + '\n';
  writeFileSync(join(dir, name), text);
  index.push(`${name}\t${theme.caps.color}\t${theme.glyphs === unicode ? 'unicode' : 'ascii'}\t${theme.columns}\t${text.split('\n').length - 1} lines`);
}
writeFileSync(join(dir, 'INDEX.tsv'), 'file\tcolor\tglyphs\tcolumns\tsize\n' + index.join('\n') + '\n');
console.log(index.join('\n'));
