import test from 'node:test';
import assert from 'node:assert/strict';
import { createTheme, live, plainTheme } from '../dist/index.js';

function fakeTty(columns = 40) {
  const chunks = [];
  return { chunks, isTTY: true, columns, rows: 10, write(s) { chunks.push(String(s)); return true; }, on() { return this; }, off() { return this; } };
}
function pipe() { const chunks = []; return { chunks, isTTY: false, write(s) { chunks.push(String(s)); return true; } }; }
const SHOW = '\u001b[?25h';

test('non-TTY: one line per distinct update, no escapes, final text on done', () => {
  const stream = pipe();
  const region = live(plainTheme(40), { stream });
  region.update('a'); region.update('a'); region.update('b'); region.done('end');
  assert.deepEqual(stream.chunks, ['a\n', 'b\n', 'end\n']);
  assert.equal(region.active, false);
});

test('TTY: repaints in place, hides then shows the cursor, done is idempotent', async () => {
  const stream = fakeTty(40);
  const theme = createTheme({ env: { FORCE_COLOR: '1' }, argv: [], platform: 'linux', stream });
  const region = live(theme, { stream, interval: 5 });
  region.update('working');
  await new Promise((r) => setTimeout(r, 30));
  region.done('finished');
  region.done('again');
  const all = stream.chunks.join('');
  assert.ok(all.includes('\u001b[?25l'), 'cursor hidden');
  assert.ok(all.endsWith('finished\n' + SHOW) || all.endsWith(SHOW), 'cursor shown last');
  assert.ok(!all.includes('again'), 'second done ignored');
  assert.ok(all.includes('working'));
});

test('abort signal finishes the region and removes its listener', async () => {
  const stream = fakeTty(40);
  const controller = new AbortController();
  const theme = createTheme({ env: {}, argv: [], platform: 'linux', stream });
  const region = live(theme, { stream, signal: controller.signal, interval: 5 });
  region.update('x');
  controller.abort();
  assert.equal(region.active, false);
  assert.ok(stream.chunks.join('').endsWith(SHOW));
  const before = stream.chunks.length;
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(stream.chunks.length, before, 'no repaint after abort');
});
