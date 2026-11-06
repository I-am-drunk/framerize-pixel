import test from 'node:test';
import assert from 'node:assert/strict';
import { box, createTheme, help, keyValues, plainTheme, progress, rule, statusRows, strip, table, taskList, width, withTick } from '../dist/index.js';

// Deterministic fuzz: random widths, ticks and hostile strings. Every line must
// fit the width, strip() must leave no escapes, and nothing may throw.
const pool = ['a', ' ', '长', '👨‍👩‍👧', 'é', '́', '\t', '\u001b[31m', '\u001b[0m', '…', '-', '‍', 'ok', 'Z'.repeat(20)];
let seed = 7;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const str = (max = 60) => Array.from({ length: Math.floor(rnd() * max) }, () => pool[Math.floor(rnd() * pool.length)]).join('');

function samples(theme) {
  return {
    box: () => box(theme, [str(), str(200)], { title: str(40) }),
    rule: () => rule(theme, str(80)),
    status: () => statusRows(theme, [{ status: 'ok', label: str(), detail: str(120) }, { status: 'active', label: str(30) }]),
    tasks: () => taskList(theme, [{ id: '1', title: str(), state: 'active', note: str() }, { id: '2', title: str(), state: 'failed' }]),
    table: () => table(theme, [{ key: 'a', header: str(10) }, { key: 'b', header: str(10), align: 'right' }], [{ a: str(), b: str(30) }, { a: str(5), b: Math.floor(rnd() * 1e6) }]),
    progress: () => progress(theme, Math.floor(rnd() * 20) - 2, Math.floor(rnd() * 12), { label: str(30), counts: rnd() > 0.5 }),
    kv: () => keyValues(theme, [{ key: str(20), value: str() }, { key: 'token', value: str(), secret: true }]),
    help: () => help(theme, { name: str(10), version: '1.0.0', tagline: str(100), usage: [str(90)], commands: [{ name: str(25), summary: str(120) }], options: [{ name: str(12), summary: str(80) }], footer: str(90) }),
  };
}

test('fuzz: 200 random widths and ticks, every component fits and stays clean', () => {
  for (let i = 0; i < 200; i += 1) {
    const columns = 20 + Math.floor(rnd() * 180);
    const color = createTheme({ env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' }, argv: [], platform: 'linux', columns, stream: { isTTY: true } });
    for (const theme of [plainTheme(columns), withTick(color, Math.floor(rnd() * 40))]) {
      for (const [name, fn] of Object.entries(samples(theme))) {
        const out = fn();
        const wide = strip(out).split('\n').filter((l) => width(l) > columns);
        assert.deepEqual(wide, [], `${name} at ${columns} columns`);
        assert.ok(!strip(out).includes('\u001b'), `${name} leaked an escape after strip`);
      }
    }
  }
});
