import { fit, truncate, width, wrap } from './text.js';
import type { Theme } from './theme.js';

export interface HelpEntry { readonly name: string; readonly summary: string; }

export interface HelpSpec {
  readonly name: string;
  readonly version?: string;
  readonly tagline?: string;
  readonly usage?: readonly string[];
  readonly commands?: readonly HelpEntry[];
  readonly options?: readonly HelpEntry[];
  readonly examples?: readonly HelpEntry[];
  readonly footer?: string;
}

/** Below this many summary cells, summaries move under their names. */
export const STACK_BELOW = 16;

function section(theme: Theme, title: string, entries: readonly HelpEntry[]): string[] {
  if (entries.length === 0) return [];
  const nameCells = Math.min(Math.max(...entries.map((e) => width(e.name))), Math.max(10, Math.floor(theme.columns / 3)));
  const room = theme.columns - nameCells - 4;
  const out = ['', theme.paint.bold(title)];
  for (const entry of entries) {
    if (room < STACK_BELOW) {
      out.push(`  ${theme.paint.role('accent')(truncate(entry.name, theme.columns - 2, theme.glyphs.ellipsis))}`);
      for (const line of wrap(entry.summary, theme.columns - 4)) out.push(`    ${line}`);
      continue;
    }
    const lines = wrap(entry.summary, room);
    out.push(`  ${theme.paint.role('accent')(fit(entry.name, nameCells))}  ${lines[0] ?? ''}`);
    for (const rest of lines.slice(1)) out.push(`  ${' '.repeat(nameCells)}  ${rest}`);
  }
  return out;
}

/** Help text: name line, usage, commands, options, examples. Fits narrow widths. */
export function help(theme: Theme, spec: HelpSpec): string {
  const head = theme.paint.bold(spec.name) + (spec.version === undefined ? '' : ' ' + theme.paint.dim(spec.version));
  const out = [head];
  if (spec.tagline !== undefined) out.push(...wrap(spec.tagline, theme.columns));
  if (spec.usage !== undefined && spec.usage.length > 0) {
    out.push('', theme.paint.bold('Usage'));
    for (const usage of spec.usage) out.push(...wrap(usage, theme.columns - 4).map((line, i) => (i === 0 ? '  ' : '    ') + line));
  }
  out.push(...section(theme, 'Commands', spec.commands ?? []));
  out.push(...section(theme, 'Options', spec.options ?? []));
  out.push(...section(theme, 'Examples', spec.examples ?? []));
  if (spec.footer !== undefined) out.push('', ...wrap(theme.paint.role('muted')(spec.footer), theme.columns));
  return out.join('\n');
}
