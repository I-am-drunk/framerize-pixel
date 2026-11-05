// Runs inside the clean consumer: imports the installed package and renders.
import { createTheme, plainTheme, showcase, statusRows, strip, VERSION } from 'framerize-pixel';
const theme = plainTheme(40);
const rendered = showcase(theme);
if (rendered.includes('\u001b')) throw new Error('plain theme leaked escapes');
const human = createTheme({ env: { FORCE_COLOR: '3' }, argv: [], platform: 'linux', columns: 60, stream: { isTTY: true } });
const row = statusRows(human, [{ status: 'ok', label: 'ok', detail: 'd' }]);
if (!row.includes('\u001b[38;2;')) throw new Error('forced truecolor produced no 24-bit code');
if (strip(row) !== '▀▄ ok  d') throw new Error('unexpected row: ' + JSON.stringify(strip(row)));
console.log(JSON.stringify({ version: VERSION, lines: rendered.split('\n').length }));
