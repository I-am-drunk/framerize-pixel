import test from 'node:test';
import assert from 'node:assert/strict';
import { createOutput } from '../dist/index.js';

function sink() { const chunks = []; return { chunks, write(s) { chunks.push(String(s)); return true; } }; }
const styled = '\u001b[1mbold\u001b[22m';

test('json mode: only JSON reaches stdout, human text goes to stderr stripped', () => {
  const stdout = sink(); const stderr = sink();
  const out = createOutput({ mode: 'json', stdout, stderr });
  out.say(styled);
  out.note(styled);
  out.json({ a: styled, n: 1 });
  assert.deepEqual(stdout.chunks, ['{"a":"bold","n":1}\n']);
  assert.deepEqual(stderr.chunks, ['bold\n']);
  assert.ok(!stdout.chunks.join('').includes('\u001b'));
});

test('json mode: say with always writes stripped text to stdout', () => {
  const stdout = sink(); const stderr = sink();
  createOutput({ mode: 'json', stdout, stderr }).say(styled, { always: true });
  assert.deepEqual(stdout.chunks, ['bold\n']);
});

test('plain mode strips both streams and ignores json()', () => {
  const stdout = sink(); const stderr = sink();
  const out = createOutput({ mode: 'plain', stdout, stderr });
  out.say(styled); out.note(styled); out.json({ x: 1 });
  assert.deepEqual(stdout.chunks, ['bold\n']);
  assert.deepEqual(stderr.chunks, ['bold\n']);
});

test('human mode passes escapes through and ignores json()', () => {
  const stdout = sink(); const stderr = sink();
  const out = createOutput({ mode: 'human', stdout, stderr });
  out.say(styled); out.json({ x: 1 });
  assert.deepEqual(stdout.chunks, [styled + '\n']);
});
