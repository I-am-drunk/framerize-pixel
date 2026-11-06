import test from 'node:test';
import assert from 'node:assert/strict';
import { createHover, DWELL_MS, MOTION, TICK_MS, unicode, width } from '../dist/index.js';

const rest = (h) => h.phase === 'rest';

test('a fast pass never plays: enter then leave before the dwell leaves the mark at rest', () => {
  const h = createHover(unicode, true, 'ok');
  h.pointerEnter(0);
  assert.equal(h.phase, 'armed');
  assert.equal(h.tick(DWELL_MS / 2), '✔ ', 'still the plain symbol');
  h.pointerLeave(DWELL_MS / 2 + 1);
  assert.ok(rest(h), 'nothing played, nothing exits');
});

test('after the dwell the enter plays once, then loops; leave plays the designed exit to rest', () => {
  const h = createHover(unicode, true, 'warn');
  h.pointerEnter(0);
  let now = DWELL_MS;
  const enter = [];
  for (let i = 0; i < MOTION.warn.enter.length; i += 1) { enter.push(h.tick(now)); now += TICK_MS; }
  assert.ok(enter.slice(0, -1).every((f) => /^[⠀-⣿]{2}$/.test(f)), 'enter frames are braille pixels');
  assert.equal(enter.at(-1), '⚠ ', 'the last enter frame snaps to the symbol');
  assert.equal(h.phase, 'loop');
  h.pointerLeave(now);
  const exit = [];
  while (h.phase === 'exit') { exit.push(h.tick(now)); now += TICK_MS; }
  assert.deepEqual(exit.map(width), exit.map(() => 2), 'every exit frame is two cells');
  assert.notDeepEqual(exit, [...enter].reverse(), 'the exit is not the enter reversed');
  assert.ok(rest(h));
});

test('re-entering mid-exit resumes the enter at the matching depth instead of restarting', () => {
  const h = createHover(unicode, true, 'bad');
  h.pointerEnter(0);
  let now = DWELL_MS;
  for (let i = 0; i < MOTION.bad.enter.length + 2; i += 1) { h.tick(now); now += TICK_MS; }
  h.pointerLeave(now);
  h.tick(now); now += TICK_MS;            // one exit frame drawn
  h.pointerEnter(now);
  assert.equal(h.phase, 'enter', 'back to enter without passing through armed');
  const frame = h.tick(now);
  assert.equal(width(frame), 2);
  assert.notEqual(frame, MOTION.bad.enter[0] && '⠑⢄', 'does not restart from the first strike');
});
