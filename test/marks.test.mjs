import test from 'node:test';
import assert from 'node:assert/strict';
import { ascii, createTheme, mark, markFrame, plainTheme, statusRows, strip, unicode, width, withTick } from '../dist/index.js';

const STATUSES = ['ok', 'bad', 'warn', 'info', 'pending', 'active', 'done', 'skip'];

test('tick 0 is the resting glyph for every status in both glyph sets', () => {
  for (const s of STATUSES) {
    assert.equal(markFrame(unicode, true, s, 0), unicode[s]);
    assert.equal(markFrame(ascii, false, s, 0), ascii[s]);
  }
});

test('every frame of every sequence is exactly two cells wide', () => {
  for (const s of STATUSES) for (let t = 0; t < 64; t += 1) {
    assert.equal(width(markFrame(unicode, true, s, t)), 2, `${s} unicode tick ${t}`);
    assert.equal(width(markFrame(ascii, false, s, t)), 2, `${s} ascii tick ${t}`);
  }
});

test('a theme without a tick renders the static mark; withTick animates it', () => {
  const t = createTheme({ env: { TERM: 'xterm' }, argv: [], platform: 'linux', columns: 40, stream: { isTTY: false } });
  assert.equal(strip(mark(t, 'active')), '▒▒');
  const frames = new Set(Array.from({ length: 8 }, (_, i) => strip(mark(withTick(t, i + 1), 'active'))));
  assert.ok(frames.size >= 3, `active cycles through frames: ${[...frames].join(' ')}`);
  assert.equal(strip(mark(withTick(t, 5), 'done')), '▓▓', 'done never moves');
  assert.equal(strip(mark(withTick(t, 5), 'skip')), '··', 'skip never moves');
});

test('animated rows keep their width and alignment at every tick', () => {
  const rows = [{ status: 'ok', label: 'service', detail: 'running' }, { status: 'active', label: 'upstream', detail: 'checking' }];
  const base = statusRows(plainTheme(40), rows);
  for (let t = 0; t < 32; t += 1) {
    const out = statusRows(withTick(plainTheme(40), t), rows);
    assert.deepEqual(out.split('\n').map(width), base.split('\n').map(width), `tick ${t}`);
  }
});

test('no animation frame equals another status\'s resting glyph, so NO_COLOR rows stay readable', () => {
  for (const [set, uni] of [[unicode, true], [ascii, false]]) {
    const resting = new Map(STATUSES.map((s) => [set[s], s]));
    for (const s of STATUSES) for (let t = 0; t < 64; t += 1) {
      const frame = markFrame(set, uni, s, t);
      const owner = resting.get(frame);
      assert.ok(owner === undefined || owner === s, `${s} tick ${t} draws ${owner}'s resting glyph ${JSON.stringify(frame)}`);
    }
  }
});
