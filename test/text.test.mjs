import test from 'node:test';
import assert from 'node:assert/strict';
import { fit, pad, strip, truncate, width, wrap } from '../dist/index.js';

test('width counts cells, not code units', () => {
  assert.equal(width('abc'), 3);
  assert.equal(width('长名字'), 6, 'CJK is two cells each');
  assert.equal(width('é'), 1, 'combining accent adds no width');
  assert.equal(width('👨‍👩‍👧'), 2, 'ZWJ family is one grapheme, two cells');
  assert.equal(width('\u001b[31mred\u001b[39m'), 3, 'escapes are free');
  assert.equal(width(''), 0);
});

test('pad never truncates and honors alignment', () => {
  assert.equal(pad('ab', 5), 'ab   ');
  assert.equal(pad('ab', 5, 'right'), '   ab');
  assert.equal(pad('ab', 5, 'center'), ' ab  ');
  assert.equal(pad('toolong', 3), 'toolong');
  assert.equal(pad('长', 4), '长  ');
});

test('truncate keeps the width budget with wide glyphs and escapes', () => {
  assert.equal(truncate('abcdef', 4), 'abc…');
  assert.equal(truncate('abcd', 4), 'abcd');
  assert.equal(width(truncate('长名字长名字', 5)), 5);
  assert.equal(truncate('abc', 1), 'a');
  assert.equal(truncate('abc', 0), '');
  assert.equal(truncate('abcdef', 4, '~'), 'abc~');
  const styled = truncate('\u001b[31mabcdef\u001b[39m', 4);
  assert.equal(strip(styled), 'abc…');
  assert.ok(styled.endsWith('\u001b[39m…') || styled.includes('\u001b[39m'), 'closing code survives truncation');
});

test('fit is exactly the requested width', () => {
  for (const s of ['', 'a', 'abcdefghij', '长名字长名字', 'ééé']) for (const n of [1, 3, 5, 8]) assert.equal(width(fit(s, n)), n, `${JSON.stringify(s)} at ${n}`);
});

test('wrap breaks words, keeps styles and trims trailing spaces', () => {
  assert.deepEqual(wrap('one two three', 7), ['one two', 'three']);
  assert.deepEqual(wrap('abcdefghij', 4), ['abcd', 'efgh', 'ij']);
  const lines = wrap('\u001b[1mbold words here\u001b[22m', 6);
  assert.ok(lines.length >= 2 && lines.every((l) => width(l) <= 6));
  assert.ok(lines.every((l) => !l.endsWith(' ')));
});
