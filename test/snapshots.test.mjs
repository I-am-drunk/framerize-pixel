import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTheme, phosphor, plainTheme, showcase } from '../dist/index.js';

// Pins the showcase to the committed captures. Regenerate with `npm run captures`
// after an intended visual change and list the change in CHANGELOG.md.
const dir = new URL('../captures/', import.meta.url);
const tty = { isTTY: true };
const linux = { argv: [], platform: 'linux' };
const cases = {
  'plain-ascii-40.txt': plainTheme(40),
  'plain-unicode-60.txt': createTheme({ ...linux, env: { TERM: 'xterm-256color', LANG: 'en_US.UTF-8' }, mode: 'plain', columns: 60 }),
  'color16-unicode-40.ansi': createTheme({ ...linux, env: { TERM: 'xterm', LANG: 'C.UTF-8' }, columns: 40, stream: tty }),
  'truecolor-unicode-100.ansi': createTheme({ ...linux, env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, columns: 100, stream: tty }),
  'truecolor-phosphor-80.ansi': createTheme({ ...linux, env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, columns: 80, stream: tty, palette: phosphor }),
  'nocolor-unicode-20.txt': createTheme({ ...linux, env: { NO_COLOR: '1', TERM: 'xterm-256color' }, columns: 20, stream: tty }),
  'dumb-unicode-80.txt': createTheme({ ...linux, env: { TERM: 'dumb' }, columns: 80, stream: tty }),
};

for (const [name, theme] of Object.entries(cases)) {
  test(`showcase matches captures/${name}`, () => {
    const expected = readFileSync(new URL(name, dir), 'utf8');
    assert.equal(showcase(theme) + '\n', expected, `run \`npm run captures\` if this change is intended`);
  });
}
