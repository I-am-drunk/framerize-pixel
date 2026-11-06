import test from 'node:test';
import assert from 'node:assert/strict';
import pty from 'node-pty';
import { BIN, ROOT, CURSOR_HIDE, CURSOR_SHOW } from './helpers.mjs';
import { strip, width } from '../../dist/index.js';

const MOUSE_ON = '\u001b[?1003h';
const MOUSE_OFF = '\u001b[?1003l';

/** Spawn the hover board, replay synthetic SGR mouse reports, resolve with the transcript. */
function hoverRun(reports, seconds = 3) {
  const p = pty.spawn(process.execPath, [BIN, 'hover', `--seconds=${seconds}`, '--width=50'], { name: 'xterm-256color', cols: 50, rows: 24, cwd: ROOT, env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '/tmp', TERM: 'xterm-256color', LANG: 'C.UTF-8' } });
  let out = '';
  p.onData((d) => { out += d; });
  for (const [at, text] of reports) setTimeout(() => p.write(text), at);
  const kill = setTimeout(() => p.kill(), 15_000);
  return new Promise((resolve) => p.onExit(({ exitCode }) => { clearTimeout(kill); resolve({ exitCode, out }); }));
}

test('hover: a dwell on the warn mark plays braille frames; leaving plays the exit; modes restored', async () => {
  const { exitCode, out } = await hoverRun([[400, '\u001b[<35;2;4M'], [1300, '\u001b[<35;20;10M']]);
  assert.equal(exitCode, 0);
  assert.ok(out.includes(MOUSE_ON) && out.lastIndexOf(MOUSE_OFF) > out.indexOf(MOUSE_ON), 'mouse tracking turned on then off');
  const frames = out.match(/[⠀-⣿]{2}/g) ?? [];
  assert.ok(frames.length >= 6, `enter and exit frames drawn: ${frames.length}`);
  assert.ok(frames.includes('⣤⣤') || frames.includes('⣀⣀'), 'the designed triangle exit (sinking rows) appeared');
  assert.ok(out.lastIndexOf(CURSOR_SHOW) > out.lastIndexOf(CURSOR_HIDE), 'cursor restored');
  const cells = out.split(/\u001b\[[0-9;?]*[A-LN-Za-ln-z]|\r|\n/).map((c) => width(strip(c)));
  assert.equal(Math.max(...cells), 50, 'no segment wider than the PTY');
});

test('hover: a fast pass over a mark plays nothing', async () => {
  const { exitCode, out } = await hoverRun([[400, '\u001b[<35;2;3M'], [430, '\u001b[<35;20;10M']], 2);
  assert.equal(exitCode, 0);
  assert.deepEqual(out.match(/[⠀-⣿]{2}/g) ?? [], [], 'no braille frame drawn for a 30 ms pass');
});
