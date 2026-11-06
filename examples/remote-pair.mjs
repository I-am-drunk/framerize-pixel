#!/usr/bin/env node
// Framerize Remote pairing flow with synthetic state. Prompts have defaults,
// so pipes and agents run straight through; a TTY gets the interactive path.
// Flags: --json, --plain, --ascii. Exit 0, or 130 when cancelled.
import { box, confirm, createOutput, createTheme, isCancelled, live, secret, statusRows, taskList, text, updateTask, withTick } from '../dist/index.js';

const args = process.argv.slice(2);
const mode = args.includes('--json') ? 'json' : args.includes('--plain') ? 'plain' : 'human';
const theme = createTheme({ mode, ascii: args.includes('--ascii') });
const out = createOutput({ mode });
const controller = new AbortController();
process.once('SIGINT', () => controller.abort());
const signal = controller.signal;

out.say(box(theme, 'Pair this machine with a Framerize Server.', { title: 'framerize remote up' }));
const url = await text(theme, { message: 'Server URL', defaultValue: 'http://127.0.0.1:8788', signal,
  validate: (v) => (/^https?:\/\//.test(v) ? undefined : 'must start with http:// or https://') });
const token = isCancelled(url) ? url : await secret(theme, { message: 'Pairing token (optional)', signal });
const install = isCancelled(url) ? url : await confirm(theme, { message: 'Install the user service?', initialValue: false, signal });
if (isCancelled(url) || isCancelled(install)) {
  // No hard exit: the prompt already restored the terminal, and exitCode lets Node flush stdout.
  out.note('cancelled, nothing written'); out.json({ cancelled: true }); process.exitCode = 130;
} else {

let tasks = [
  { id: 'probe', title: 'Probe server', state: 'pending' },
  { id: 'save', title: 'Save profile', state: 'pending' },
  { id: 'service', title: 'Install service', state: install ? 'pending' : 'skipped', note: install ? undefined : 'not requested' },
];
const region = live(theme, { signal });
for (const id of ['probe', 'save', ...(install ? ['service'] : [])]) {
  tasks = updateTask(tasks, id, { state: 'active' });
  region.update((tick) => taskList(withTick(theme, tick), tasks)); // marks animate per tick
  await new Promise((r) => setTimeout(r, 120));
  tasks = updateTask(tasks, id, { state: 'done', note: id === 'probe' ? '200 in 12 ms (synthetic)' : undefined });
}
region.done(taskList(theme, tasks));
out.say(statusRows(theme, [{ status: 'ok', label: 'server', detail: url }, { status: isCancelled(token) ? 'skip' : 'ok', label: 'token', detail: isCancelled(token) ? 'none' : 'stored, not shown' }]));
out.json({ server: url, tokenProvided: !isCancelled(token), service: install, tasks });
}
