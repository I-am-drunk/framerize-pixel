import test from 'node:test';
import assert from 'node:assert/strict';
import { detect } from '../dist/index.js';

const tty = { isTTY: true, columns: 100, rows: 30 };
const pipe = { isTTY: false };
const base = { argv: [], platform: 'linux' };

test('piped output has no color and defaults to 80 columns', () => {
  const c = detect({ ...base, env: { TERM: 'xterm-256color' }, stream: pipe });
  assert.equal(c.tty, false);
  assert.equal(c.color, 0);
  assert.equal(c.columns, 80);
});

test('TTY with TERM levels', () => {
  assert.equal(detect({ ...base, env: { TERM: 'xterm' }, stream: tty }).color, 1);
  assert.equal(detect({ ...base, env: { TERM: 'xterm-256color' }, stream: tty }).color, 2);
  assert.equal(detect({ ...base, env: { TERM: 'xterm-256color', COLORTERM: 'truecolor' }, stream: tty }).color, 3);
  assert.equal(detect({ ...base, env: { TERM: 'dumb' }, stream: tty }).color, 0);
  assert.equal(detect({ ...base, env: {}, stream: tty }).color, 0);
});

test('NO_COLOR beats FORCE_COLOR, flags and TERM', () => {
  const c = detect({ ...base, env: { NO_COLOR: '1', FORCE_COLOR: '3', COLORTERM: 'truecolor' }, argv: ['--color'], stream: tty });
  assert.equal(c.color, 0);
  assert.equal(detect({ ...base, env: { NO_COLOR: '', COLORTERM: 'truecolor', TERM: 'xterm' }, stream: tty }).color, 3, 'empty NO_COLOR is ignored');
});

test('FORCE_COLOR applies to pipes; --no-color wins over FORCE_COLOR', () => {
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '2' }, stream: pipe }).color, 2);
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '' }, stream: pipe }).color, 1);
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '9' }, stream: pipe }).color, 3);
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '3' }, argv: ['--no-color'], stream: tty }).color, 0);
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '3' }, argv: ['--', '--no-color'], stream: tty }).color, 3, 'flags after -- are ignored');
});

test('CI vendors and plain/json modes', () => {
  assert.equal(detect({ ...base, env: { CI: 'true', GITHUB_ACTIONS: 'true' }, stream: tty }).color, 3);
  assert.equal(detect({ ...base, env: { CI: 'true' }, stream: tty }).color, 0);
  assert.equal(detect({ ...base, env: { CI: 'true' }, stream: tty }).ci, true);
  assert.equal(detect({ ...base, env: { COLORTERM: 'truecolor' }, stream: tty, mode: 'plain' }).color, 0);
  assert.equal(detect({ ...base, env: { FORCE_COLOR: '3' }, stream: tty, mode: 'json' }).color, 0);
});

test('unicode heuristics', () => {
  assert.equal(detect({ ...base, env: { TERM: 'xterm' }, stream: tty }).unicode, true);
  assert.equal(detect({ ...base, env: { TERM: 'linux' }, stream: tty }).unicode, false);
  assert.equal(detect({ ...base, env: { TERM: 'xterm', LANG: 'C' }, stream: tty }).unicode, false);
  assert.equal(detect({ ...base, env: { TERM: 'xterm', LC_ALL: 'POSIX' }, stream: tty }).unicode, false);
  assert.equal(detect({ ...base, env: { TERM: 'xterm', FRAMERIZE_PIXEL_ASCII: '1' }, stream: tty }).unicode, false);
  assert.equal(detect({ ...base, env: {}, platform: 'win32', stream: tty }).unicode, false);
  assert.equal(detect({ ...base, env: { WT_SESSION: 'x' }, platform: 'win32', stream: tty }).unicode, true);
  assert.equal(detect({ ...base, env: { TERM: 'xterm' }, stream: tty, mode: 'plain' }).unicode, true, 'plain keeps glyph detection');
});

test('columns and rows come from the stream, override wins, zero is ignored', () => {
  assert.equal(detect({ ...base, env: {}, stream: tty }).columns, 100);
  assert.equal(detect({ ...base, env: {}, stream: tty }).rows, 30);
  assert.equal(detect({ ...base, env: {}, stream: tty, columns: 42 }).columns, 42);
  assert.equal(detect({ ...base, env: {}, stream: { isTTY: true, columns: 0 } }).columns, 80);
});
