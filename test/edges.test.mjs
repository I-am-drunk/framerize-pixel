import test from 'node:test';
import assert from 'node:assert/strict';
import { box, help, keyValues, plainTheme, progress, rule, statusRows, table, taskList, width } from '../dist/index.js';

const t = plainTheme(20);

test('rule never throws and never exceeds the requested cells', () => {
  assert.equal(rule(t, 'x', 0), '');
  assert.equal(rule(t, 'x', -5), '');
  assert.equal(rule(t, 'x', 3), '---', 'too narrow for a label: plain bar');
  assert.equal(width(rule(t, 'label', 8)), 8);
  assert.equal(width(rule(t, undefined, NaN)), 20, 'NaN falls back to the theme width');
});

test('progress treats NaN as empty and infinity as full, never prints NaN', () => {
  assert.match(progress(t, NaN, 10), /^\.+ {3}0%$/);
  assert.match(progress(t, Infinity, 10), /^#+ 100%$/);
  assert.match(progress(t, 3, NaN), /^#+\.* *\d+%$/);
  assert.match(progress(t, 3, -1), /^#+ 100%$/);
  assert.ok(!progress(t, NaN, NaN).includes('NaN'));
});

test('empty inputs render empty or a bare frame without throwing', () => {
  assert.equal(statusRows(t, []), '');
  assert.equal(taskList(t, []), '');
  assert.equal(keyValues(t, []), '');
  assert.equal(help(t, { name: '' }), '');
  assert.equal(box(t, []).split('\n').length, 2, 'top and bottom edge only');
  assert.equal(table(t, [{ key: 'a', header: 'A' }], []).split('\n').length, 2);
});
