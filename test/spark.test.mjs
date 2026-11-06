import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpark, createTheme, plainTheme, SPARK_FRAMES, SPARK_MS, strip, width } from '../dist/index.js';

const color = createTheme({ env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, argv: [], platform: 'linux', columns: 40, stream: { isTTY: true } });

test('a spark starts when input grows, runs four one-cell frames, then goes idle', () => {
  const s = createSpark(color, true);
  assert.equal(s.frame(0, 1000), null, 'empty input never sparks');
  const seen = [0, 1, 2, 3].map((i) => strip(s.frame(1, 1000 + i * SPARK_MS) ?? ''));
  assert.deepEqual(seen, [...SPARK_FRAMES]);
  assert.ok(seen.every((g) => width(g) === 1), 'every frame is one cell');
  assert.equal(s.frame(1, 1000 + 4 * SPARK_MS), null, 'idle after the last frame');
});

test('deleting never sparks; typing again restarts the sequence', () => {
  const s = createSpark(color, true);
  s.frame(3, 0);
  assert.equal(s.frame(2, 10 * SPARK_MS), null, 'shorter input: no spark');
  assert.equal(strip(s.frame(3, 20 * SPARK_MS) ?? ''), SPARK_FRAMES[0], 'growth restarts at frame 0');
});

test('ASCII sparks use plain characters and the plain theme paints nothing', () => {
  const s = createSpark(plainTheme(40), false);
  const g = s.frame(1, 0);
  assert.ok(g !== null && !g.includes('\u001b') && /^[+x*]$/.test(g));
});

test('tick schedules one repaint and stop cancels it', async () => {
  const s = createSpark(color, true);
  let repaints = 0;
  s.tick(() => { repaints += 1; });
  s.tick(() => { repaints += 1; });
  await new Promise((r) => setTimeout(r, SPARK_MS * 3));
  assert.equal(repaints, 1, 'second tick while pending is ignored');
  s.tick(() => { repaints += 1; });
  s.stop();
  await new Promise((r) => setTimeout(r, SPARK_MS * 3));
  assert.equal(repaints, 1, 'stop cancels the pending repaint');
});
