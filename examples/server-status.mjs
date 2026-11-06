#!/usr/bin/env node
// Framerize Server status screen, rendered from synthetic data. No network,
// no accounts. Flags: --json, --plain, --ascii, --width=N. Exit 0.
import { box, createOutput, createTheme, keyValues, progress, rule, statusRows, table, VERSION } from '../dist/index.js';

const args = process.argv.slice(2);
const mode = args.includes('--json') ? 'json' : args.includes('--plain') ? 'plain' : 'human';
const widthArg = args.find((a) => a.startsWith('--width='));
const theme = createTheme({ mode, ascii: args.includes('--ascii'), ...(widthArg ? { columns: Number(widthArg.slice(8)) } : {}) });
const out = createOutput({ mode });

const status = { listen: '127.0.0.1:8788', uptime: '3h 12m', accounts: 3, ready: 2, queue: { done: 41, total: 48 } };
const accounts = [
  { id: 'alpha', kind: 'oauth', state: 'ready', used: '2m ago' },
  { id: 'beta-长名字', kind: 'token', state: 'expired', used: '3d ago' },
  { id: 'gamma', kind: 'oauth', state: 'disabled', used: 'never' },
];

out.say(box(theme, [`Framerize Server ${VERSION}`, `listening on ${status.listen}, up ${status.uptime}`], { title: 'server' }));
out.say(statusRows(theme, [
  { status: 'ok', label: 'listener', detail: status.listen },
  { status: status.ready === status.accounts ? 'ok' : 'warn', label: 'accounts', detail: `${status.ready} of ${status.accounts} ready` },
  { status: 'info', label: 'queue', detail: `${status.queue.done}/${status.queue.total} jobs finished` },
]));
out.say('');
out.say(rule(theme, 'accounts'));
out.say(table(theme, [{ key: 'id', header: 'ID' }, { key: 'kind', header: 'Kind' }, { key: 'state', header: 'State' }, { key: 'used', header: 'Used', align: 'right' }], accounts));
out.say('');
out.say(progress(theme, status.queue.done, status.queue.total, { label: 'queue', counts: true }));
out.say(keyValues(theme, [{ key: 'config', value: '~/.config/framerize/server.json' }, { key: 'admin token', value: 'synthetic-not-real', secret: true }]));
out.json({ version: VERSION, listen: status.listen, accounts, queue: status.queue });
