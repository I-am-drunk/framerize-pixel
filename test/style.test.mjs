import test from 'node:test';
import assert from 'node:assert/strict';
import { createPainter, crt, phosphor, strip } from '../dist/index.js';

test('level 0 is identity for every role and modifier', () => {
  const p = createPainter(crt, 0);
  for (const role of ['ink', 'muted', 'accent', 'ok', 'warn', 'bad', 'info', 'frame']) assert.equal(p.role(role)('x'), 'x');
  assert.equal(p.bold('x'), 'x'); assert.equal(p.dim('x'), 'x'); assert.equal(p.inverse('x'), 'x');
});

test('each level emits its own code family', () => {
  assert.match(createPainter(crt, 1).role('ok')('x'), /^\u001b\[3[0-7]m|\u001b\[9[0-7]m/);
  assert.equal(createPainter(crt, 2).role('ok')('x'), '\u001b[38;5;114mx\u001b[39m');
  assert.equal(createPainter(crt, 3).role('ok')('x'), '\u001b[38;2;98;212;112mx\u001b[39m');
  assert.equal(createPainter(phosphor, 3).role('accent')('x'), '\u001b[38;2;190;255;140mx\u001b[39m');
});

test('nested same-kind styles stay balanced and reopen after the inner close', () => {
  const p = createPainter(crt, 3);
  const inner = p.role('bad')('in');
  const outer = p.role('ok')(`a ${inner} b`);
  assert.equal(strip(outer), 'a in b');
  const reopen = outer.indexOf('\u001b[39m') < outer.lastIndexOf('\u001b[38;2;98;212;112m');
  assert.ok(reopen, 'outer color reopens after inner close: ' + JSON.stringify(outer));
  assert.ok(outer.endsWith('\u001b[39m'));
});

test('empty input paints to empty string', () => {
  const p = createPainter(crt, 3);
  assert.equal(p.role('ok')(''), '');
  assert.equal(p.bold(''), '');
});
