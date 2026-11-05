import { fit, truncate, width } from './text.js';
import type { Theme } from './theme.js';

export type Status = 'ok' | 'bad' | 'warn' | 'info' | 'pending' | 'active' | 'done' | 'skip';

export interface StatusRow {
  readonly status: Status;
  readonly label: string;
  readonly detail?: string;
}

const roleOf = { ok: 'ok', bad: 'bad', warn: 'warn', info: 'info', pending: 'muted', active: 'accent', done: 'ok', skip: 'muted' } as const;

/** The two-cell pixel mark for a status, painted in its role. */
export function mark(theme: Theme, status: Status): string {
  return theme.paint.role(roleOf[status])(theme.glyphs[status]);
}

/**
 * One row: `▀▄ label  detail`. The row never exceeds `columns` cells
 * (default: the theme width), so terminals never soft-wrap it. The label
 * gives way last; the detail is truncated or dropped first.
 */
export function statusLine(theme: Theme, row: StatusRow, labelCells?: number, columns = theme.columns): string {
  const m = mark(theme, row.status);
  const markCells = width(theme.glyphs[row.status]) + 1;
  const labelRoom = Math.max(1, columns - markCells);
  const label = labelCells === undefined ? truncate(row.label, labelRoom, theme.glyphs.ellipsis) : fit(row.label, Math.min(labelCells, labelRoom));
  const head = `${m} ${label}`;
  if (row.detail === undefined || row.detail === '') return head;
  const room = columns - markCells - width(label) - 2;
  const detail = room < 4 ? '' : truncate(row.detail, room, theme.glyphs.ellipsis);
  return detail === '' ? head : `${head}  ${theme.paint.dim(detail)}`;
}

/** Several rows with labels aligned in one column. Narrow terminals still fit. */
export function statusRows(theme: Theme, rows: readonly StatusRow[], columns = theme.columns): string {
  const widest = Math.min(Math.max(0, ...rows.map((r) => width(r.label))), Math.max(8, Math.floor(columns / 2)));
  return rows.map((row) => statusLine(theme, row, widest, columns)).join('\n');
}
