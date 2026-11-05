import test from 'node:test';
import assert from 'node:assert/strict';
import { CURSOR_HIDE, CURSOR_SHOW, spawnCli } from './helpers.mjs';
import { strip, width } from '../../dist/index.js';

const visible = (output) => strip(output).replace(/\r/g, '').split('\n');

test('showcase in a 40-column PTY paints color, uses Unicode and never overflows', async () => {
  const { exitCode, output } = await spawnCli(['showcase'], { cols: 40 });
  assert.equal(exitCode, 0);
  assert.ok(output.includes('\u001b[38;5;'), 'xterm-256color gets 256-color codes');
  assert.ok(output.includes('▛'), 'pixel corners under C.UTF-8');
  assert.deepEqual(visible(output).filter((l) => width(l) > 40), [], 'no line wider than the PTY');
  assert.ok(!output.includes(CURSOR_HIDE), 'static output never hides the cursor');
});

test('NO_COLOR and TERM=dumb in a PTY fall back to plain text and ASCII marks', async () => {
  const noColor = await spawnCli(['showcase'], { cols: 60, env: { NO_COLOR: '1' } });
  assert.equal(noColor.exitCode, 0);
  assert.ok(!noColor.output.includes('\u001b['), 'NO_COLOR output has no escapes');
  const dumb = await spawnCli(['showcase'], { cols: 60, env: { TERM: 'dumb' } });
  assert.ok(!dumb.output.includes('\u001b[') && dumb.output.includes('OK service'), 'dumb terminal gets ASCII marks');
});

test('version prints the package version and json mode keeps stdout pure', async () => {
  const human = await spawnCli(['version'], { cols: 40 });
  assert.match(strip(human.output).trim(), /^\d+\.\d+\.\d+(-[0-9a-z.]+)?$/);
  const json = await spawnCli(['showcase', '--json'], { cols: 40 });
  const parsed = JSON.parse(strip(json.output).trim());
  assert.equal(parsed.name, 'framerize-pixel');
  assert.ok(!json.output.includes(CURSOR_SHOW) && !json.output.includes('▛'), 'json mode writes nothing else');
});
