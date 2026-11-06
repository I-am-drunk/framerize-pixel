import { box, rule } from './box.js';
import { live } from './live.js';
import { createOutput } from './output.js';
import { confirm, isCancelled, secret, select, text } from './prompts.js';
import { statusRows } from './status.js';
import { createTheme } from './theme.js';
import type { OutputMode } from './types.js';

export interface DemoOptions { readonly mode: OutputMode; readonly ascii: boolean; }

/** Interactive demo. Every prompt has a default, so pipes and agents never block. */
export async function runDemo(options: DemoOptions): Promise<number> {
  const theme = createTheme({ mode: options.mode, ascii: options.ascii });
  const out = createOutput({ mode: options.mode });
  const controller = new AbortController();
  const onSignal = (): void => controller.abort();
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    out.say(box(theme, 'A short tour of prompts and live regions.', { title: 'framerize-pixel demo' }));
    const signal = controller.signal;
    const name = await text(theme, { message: 'Project name', defaultValue: 'demo', placeholder: 'demo', signal });
    if (isCancelled(name)) return cancelled(out, theme);
    const kind = await select(theme, { message: 'Palette', initialValue: 'crt', signal,
      options: [{ value: 'crt', label: 'crt', hint: 'warm amber' }, { value: 'phosphor', label: 'phosphor', hint: 'mono green' }] });
    if (isCancelled(kind)) return cancelled(out, theme);
    const token = await secret(theme, { message: 'Token (demo only, discarded)', signal });
    const ok = await confirm(theme, { message: 'Run the live region?', initialValue: true, signal });
    if (isCancelled(ok)) return cancelled(out, theme);
    if (ok === true) await spin(theme, signal);
    out.say(rule(theme, 'result'));
    out.say(statusRows(theme, [{ status: 'ok', label: 'name', detail: name }, { status: 'info', label: 'palette', detail: kind },
      { status: isCancelled(token) ? 'skip' : 'ok', label: 'token', detail: isCancelled(token) ? 'not provided' : 'received, not shown' }]));
    out.json({ name, palette: kind, tokenProvided: !isCancelled(token), live: ok });
    return 0;
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
  }
}

function cancelled(out: ReturnType<typeof createOutput>, theme: ReturnType<typeof createTheme>): number {
  out.note(statusRows(theme, [{ status: 'skip', label: 'cancelled', detail: 'no changes made' }]));
  out.json({ cancelled: true });
  return 130;
}

async function spin(theme: ReturnType<typeof createTheme>, signal: AbortSignal): Promise<void> {
  const region = live(theme, { signal });
  try {
    for (let step = 1; step <= 5 && !signal.aborted; step += 1) {
      region.update(`step ${step} of 5`);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  } finally {
    region.done(signal.aborted ? 'live region aborted' : 'live region finished');
  }
}
