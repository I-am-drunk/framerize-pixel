import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMouse, rowAt } from '../dist/index.js';

test('parseMouse reads SGR reports, keeps a trailing partial report for the next chunk', () => {
  const a = parseMouse('\u001b[<35;2;4M\u001b[<35;3;4Mabc\u001b[<35;9');
  assert.deepEqual(a.moves, [{ button: 35, x: 2, y: 4, release: false }, { button: 35, x: 3, y: 4, release: false }]);
  assert.equal(a.rest, '\u001b[<35;9');
  const b = parseMouse(a.rest + ';7m');
  assert.deepEqual(b.moves, [{ button: 35, x: 9, y: 7, release: true }]);
  assert.equal(b.rest, '');
  assert.deepEqual(parseMouse('plain keys').moves, []);
});

test('rowAt maps pointer cells to rows only over the two mark cells and the space after them', () => {
  assert.equal(rowAt({ x: 1, y: 3, button: 35, release: false }, 4), 0, 'first row under a two-line header');
  assert.equal(rowAt({ x: 3, y: 6, button: 35, release: false }, 4), 3);
  assert.equal(rowAt({ x: 4, y: 3, button: 35, release: false }, 4), -1, 'label column is not the mark');
  assert.equal(rowAt({ x: 1, y: 7, button: 35, release: false }, 4), -1, 'below the last row');
  assert.equal(rowAt({ x: 1, y: 1, button: 35, release: false }, 4), -1, 'header');
});
