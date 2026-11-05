import { box, rule } from './box.js';
import { help } from './help.js';
import { keyValues } from './keyvalue.js';
import { progress } from './progress.js';
import { statusRows } from './status.js';
import { table } from './table.js';
import { taskList } from './tasks.js';
import type { Theme } from './theme.js';
import { NAME, VERSION } from './version.js';

/** Deterministic showcase of every component. Used by captures and the CLI. */
export function showcase(theme: Theme): string {
  const parts: string[] = [];
  parts.push(rule(theme, `${NAME} ${VERSION}`));
  parts.push(box(theme, ['Retro pixel terminal styling for Framerize.', 'Readable at 40 columns, honest without color.'], { title: 'framerize-pixel' }));
  parts.push('', rule(theme, 'status'));
  parts.push(statusRows(theme, [
    { status: 'ok', label: 'service', detail: 'running on 127.0.0.1:8788' },
    { status: 'warn', label: 'upstream', detail: 'slow: 1,420 ms median over the last minute' },
    { status: 'bad', label: 'credentials', detail: 'token file missing' },
    { status: 'info', label: 'version', detail: VERSION },
  ]));
  parts.push('', rule(theme, 'tasks'));
  parts.push(taskList(theme, [
    { id: 'a', title: 'Resolve profile', state: 'done' },
    { id: 'b', title: 'Check remote', state: 'active', note: 'waiting for 200' },
    { id: 'c', title: 'Install service', state: 'pending' },
    { id: 'd', title: 'Open firewall', state: 'skipped', note: 'loopback only' },
  ]));
  parts.push('', rule(theme, 'accounts'));
  parts.push(table(theme, [
    { key: 'id', header: 'ID' }, { key: 'kind', header: 'Kind' }, { key: 'state', header: 'State' }, { key: 'used', header: 'Used', align: 'right' },
  ], [
    { id: 'alpha', kind: 'oauth', state: 'ready', used: '2m ago' },
    { id: 'beta-长名字', kind: 'token', state: 'expired', used: '3d ago' },
    { id: 'gamma', kind: 'oauth', state: 'disabled', used: 'never' },
  ]));
  parts.push('', progress(theme, 7, 12, { label: 'sync', counts: true }));
  parts.push(keyValues(theme, [{ key: 'profile', value: '~/.config/app/profile.json' }, { key: 'token', value: 'real-secret', secret: true }]));
  parts.push('', help(theme, { name: 'app', version: VERSION, usage: ['app <command> [options]'],
    commands: [{ name: 'up', summary: 'Pair, install and start the service' }, { name: 'check', summary: 'Report readiness as text or JSON' }],
    options: [{ name: '--json', summary: 'Machine-readable output; nothing else reaches stdout' }] }));
  return parts.join('\n');
}
