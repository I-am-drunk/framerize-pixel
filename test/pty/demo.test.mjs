import test from 'node:test';
import assert from 'node:assert/strict';
import { CURSOR_HIDE, CURSOR_SHOW, KEYS, spawnCli } from './helpers.mjs';
import { strip } from '../../dist/index.js';

test('demo in a PTY: enter keeps the default, y answers confirm, secret never echoes, cursor restored', async () => {
  const { exitCode, output } = await spawnCli(['demo'], { cols: 60, script: [
    ['Project name', KEYS.enter],
    ['Palette', KEYS.down + KEYS.enter],
    ['Token', 'hunter2' + KEYS.enter],
    ['Run the live region?', 'y'],
  ] });
  const text = strip(output);
  assert.equal(exitCode, 0, text);
  assert.ok(!text.includes('hunter2'), 'secret input is never echoed');
  assert.ok(text.includes('phosphor'), 'down arrow moved the selection');
  assert.ok(text.includes('live region finished'), 'y submitted the confirm without enter');
  assert.ok(output.includes(CURSOR_HIDE), 'live region hid the cursor');
  assert.ok(output.lastIndexOf(CURSOR_SHOW) > output.lastIndexOf(CURSOR_HIDE), 'cursor shown after the last hide');
});

test('demo in a PTY: Ctrl+C at the first prompt exits 130, shows the cursor and reports no changes', async () => {
  const { exitCode, output } = await spawnCli(['demo'], { cols: 60, script: [['Project name', KEYS.ctrlC]] });
  const text = strip(output);
  assert.equal(exitCode, 130, text);
  assert.ok(text.includes('cancelled') && text.includes('no changes made'));
  assert.ok(output.lastIndexOf(CURSOR_SHOW) >= output.lastIndexOf(CURSOR_HIDE), 'cursor not left hidden');
});

test('demo piped (no TTY): defaults flow through, json stdout stays pure', async () => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const { fileURLToPath } = await import('node:url');
  const bin = fileURLToPath(new URL('../../bin/framerize-pixel.js', import.meta.url));
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [bin, 'demo', '--json'], { env: { ...process.env, TERM: 'xterm' } });
  assert.deepEqual(JSON.parse(stdout), { name: 'demo', palette: 'crt', tokenProvided: false, live: true });
  assert.ok(!stderr.includes('\u001b['), 'stderr progress lines carry no escapes in json mode');
});
