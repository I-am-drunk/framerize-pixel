import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { CANCELLED, confirm, isCancelled, plainTheme, secret, select, text } from '../dist/index.js';

const theme = plainTheme(40);
const piped = () => ({ input: new PassThrough(), output: Object.assign(new PassThrough(), { isTTY: false }) });

test('non-interactive prompts return defaults without reading input', async () => {
  const io = piped();
  assert.equal(await text(theme, { message: 'name', defaultValue: 'd', ...io }), 'd');
  assert.equal(await confirm(theme, { message: 'ok?', initialValue: true, ...io }), true);
  assert.equal(await select(theme, { message: 'pick', initialValue: 'b', options: [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }], ...io }), 'b');
  assert.equal(io.output.read(), null, 'nothing written');
});

test('non-interactive prompts without defaults are CANCELLED, never hang', async () => {
  const io = piped();
  assert.equal(await text(theme, { message: 'name', ...io }), CANCELLED);
  assert.equal(await secret(theme, { message: 'token', ...io }), CANCELLED);
  assert.equal(await confirm(theme, { message: 'ok?', ...io }), CANCELLED);
  assert.equal(await select(theme, { message: 'pick', options: [{ value: 1, label: 'one' }], ...io }), CANCELLED);
  assert.equal(await select(theme, { message: 'pick', options: [], initialValue: 1, ...io }), CANCELLED, 'empty options');
  assert.ok(isCancelled(CANCELLED) && !isCancelled('x') && !isCancelled(undefined));
});

test('an already-aborted signal yields the default or CANCELLED even on a TTY-like pair', async () => {
  const controller = new AbortController();
  controller.abort();
  const io = { input: Object.assign(new PassThrough(), { isTTY: true }), output: Object.assign(new PassThrough(), { isTTY: true }), signal: controller.signal };
  assert.equal(await text(theme, { message: 'name', defaultValue: 'd', ...io }), 'd');
  assert.equal(await secret(theme, { message: 'token', ...io }), CANCELLED);
});
