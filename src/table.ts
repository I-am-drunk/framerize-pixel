import { fit, width, type Align } from './text.js';
import type { Theme } from './theme.js';

export interface Column {
  readonly key: string;
  readonly header: string;
  readonly align?: Align;
  /** Minimum cells for this column when the table must shrink. */
  readonly min?: number;
}

export type Row = Readonly<Record<string, string | number | boolean | null | undefined>>;

function cell(value: Row[string]): string {
  return value === null || value === undefined ? '' : String(value);
}

/** Natural widths, then shrink the widest column until the table fits. */
export function layout(columns: readonly Column[], rows: readonly Row[], total: number, gap = 2): number[] {
  const widths = columns.map((c) => Math.max(width(c.header), ...rows.map((r) => width(cell(r[c.key])))));
  const mins = columns.map((c) => Math.max(1, c.min ?? Math.min(4, width(c.header))));
  const budget = total - gap * Math.max(0, columns.length - 1);
  let sum = widths.reduce((a, b) => a + b, 0);
  while (sum > budget) {
    let i = -1;
    for (let k = 0; k < widths.length; k += 1) if ((widths[k] ?? 0) > (mins[k] ?? 1) && (i < 0 || (widths[k] ?? 0) > (widths[i] ?? 0))) i = k;
    if (i < 0) break;
    widths[i] = (widths[i] ?? 1) - 1;
    sum -= 1;
  }
  return widths;
}

/** A compact table: bold header, pixel rule, aligned truncated cells. */
export function table(theme: Theme, columns: readonly Column[], rows: readonly Row[]): string {
  const widths = layout(columns, rows, theme.columns);
  const line = (values: readonly string[], paint = (s: string) => s): string =>
    columns.map((c, i) => paint(fit(values[i] ?? '', widths[i] ?? 1, c.align ?? 'left', theme.glyphs.ellipsis))).join('  ');
  const head = line(columns.map((c) => c.header), theme.paint.bold);
  const bar = theme.paint.role('frame')(widths.map((w) => theme.glyphs.rule.repeat(w)).join('  '));
  return [head, bar, ...rows.map((r) => line(columns.map((c) => cell(r[c.key]))))].join('\n');
}
