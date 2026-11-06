import test from 'node:test';
import assert from 'node:assert/strict';
import { box, createTheme, help, keyValues, plainTheme, progress, rule, showcase, statusRows, strip, table, taskList, width } from '../dist/index.js';

const WIDTHS = [20, 23, 29, 40, 57, 80, 100, 132];
const long = 'a very long label that keeps going and going '.repeat(2).trim();
const wide = '长名字'.repeat(12);
const themesAt = (columns) => [
  plainTheme(columns),
  createTheme({ env: { TERM: 'xterm-256color', COLORTERM: 'truecolor' }, argv: [], platform: 'linux', columns, stream: { isTTY: true } }),
];
const tooWide = (text, columns) => strip(text).split('\n').filter((line) => width(line) > columns);

function samples(theme) {
  return {
    showcase: showcase(theme),
    box: box(theme, [long, wide], { title: long }),
    rule: rule(theme, long),
    status: statusRows(theme, [{ status: 'ok', label: long, detail: wide }, { status: 'bad', label: wide, detail: long }]),
    tasks: taskList(theme, Array.from({ length: 12 }, (_, i) => ({ id: String(i), title: long, state: 'active', note: wide }))),
    table: table(theme, [{ key: 'a', header: 'Alpha' }, { key: 'b', header: 'Beta' }, { key: 'c', header: 'Gamma', align: 'right' }], [{ a: long, b: wide, c: 12345 }]),
    progress: progress(theme, 3, 7, { label: long, counts: true }),
    keyValues: keyValues(theme, [{ key: long, value: wide }, { key: 'token', value: long, secret: true }]),
    help: help(theme, { name: 'app', version: '1.0.0', tagline: long, usage: [long], commands: [{ name: long, summary: wide }], options: [{ name: '--x', summary: long }], footer: wide }),
  };
}

for (const columns of WIDTHS) {
  test(`no component renders a line wider than ${columns} columns`, () => {
    for (const theme of themesAt(columns)) {
      for (const [name, text] of Object.entries(samples(theme))) {
        assert.deepEqual(tooWide(text, columns), [], `${name} at ${columns} (${theme.caps.color ? 'color' : 'plain'})`);
      }
    }
  });
}
