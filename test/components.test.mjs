import test from 'node:test';
import assert from 'node:assert/strict';
import { box, help, keyValues, plainTheme, progress, rule, statusRows, strip, table, taskList, width } from '../dist/index.js';

const t40 = plainTheme(40);
const t20 = plainTheme(20);
const lines = (s) => s.split('\n');
const maxWidth = (s) => Math.max(...lines(s).map(width));

test('box fits the theme width at 40 and 20 columns and wraps long words', () => {
  const b = box(t40, 'a'.repeat(100), { title: 'long' });
  assert.ok(lines(b).every((l) => width(l) === 40), b);
  const tiny = box(t20, ['x', 'y'], { title: 'a very long title that cannot fit' });
  assert.ok(lines(tiny).every((l) => width(l) === 20), tiny);
  assert.equal(lines(box(t40, 'one\ntwo')).length, 4);
});

test('rule is exactly the width with and without a label', () => {
  assert.equal(width(rule(t40)), 40);
  assert.equal(width(rule(t40, 'status')), 40);
  assert.equal(width(rule(t20, 'a label that is too long for twenty')), 20);
});

test('status rows align labels and truncate detail inside the width', () => {
  const s = statusRows(t40, [{ status: 'ok', label: 'short', detail: 'd'.repeat(80) }, { status: 'bad', label: 'a much longer label', detail: 'x' }]);
  assert.ok(maxWidth(s) <= 40, s);
  assert.match(s, /^OK short +d+~$/m);
  assert.equal(statusRows(t40, [{ status: 'warn', label: 'w' }]), '/\\ w');
});

test('task list numbers steps and maps states to marks', () => {
  const s = taskList(t40, [{ id: '1', title: 'a', state: 'done' }, { id: '2', title: 'b', state: 'failed', note: 'why' }]);
  assert.deepEqual(lines(s), ['1/2 ## a', '2/2 !! b  why']);
});

test('table shrinks the widest column until it fits', () => {
  const cols = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B', align: 'right' }];
  const rows = [{ a: 'x'.repeat(60), b: 1 }, { a: 'y', b: 22 }];
  const s = table(t40, cols, rows);
  assert.ok(lines(s).every((l) => width(l) <= 40), s);
  assert.match(lines(s)[2], / 1$/);
  assert.equal(lines(s).length, 4);
});

test('progress clamps, rounds and fits', () => {
  assert.match(progress(t40, 0, 0), /^\.+ {3}0%$/);
  assert.match(progress(t40, 3, 4), /^#+\.+ {2}75%$/);
  assert.match(progress(t40, 9, 4), /^#+ 100%$/);
  assert.match(progress(t40, -1, 4), /^\.+ {3}0%$/);
  assert.ok(width(progress(t20, 1, 2, { label: 'a long label', counts: true })) <= 20);
});

test('key/values mask secrets before rendering', () => {
  const s = keyValues(t40, [{ key: 'k', value: 'v' }, { key: 'token', value: 'hunter2', secret: true }]);
  assert.ok(!s.includes('hunter2'));
  assert.match(s, /token +\*{8}/);
});

test('help fits 40 and 20 columns and wraps summaries', () => {
  const spec = { name: 'app', version: '1.0.0', usage: ['app <cmd>'], commands: [{ name: 'serve', summary: 'Start the local API and forward inference to the configured remote server' }] };
  assert.ok(maxWidth(help(t40, spec)) <= 40);
  assert.ok(maxWidth(help(t20, spec)) <= 20, help(t20, spec));
  assert.match(help(t40, spec), /Commands\n  serve  Start/);
});
