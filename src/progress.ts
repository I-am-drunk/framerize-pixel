import { truncate, width } from './text.js';
import type { Theme } from './theme.js';

export interface ProgressOptions {
  /** Cells for the bar itself. Defaults to 24, shrunk to fit the theme width. */
  readonly cells?: number;
  readonly label?: string;
  /** Show `done/total` after the bar. Dropped first when the width is short. */
  readonly counts?: boolean;
}

/** Smallest bar still readable; label and counts give way before it. */
export const MIN_BAR = 4;

/** A pixel progress bar: `label ████░░░░ 42%`. Never exceeds the theme width. */
export function progress(theme: Theme, done: number, total: number, options: ProgressOptions = {}): string {
  const safeTotal = total > 0 ? total : 1;
  const ratio = Math.min(1, Math.max(0, done / safeTotal));
  const pct = `${String(Math.round(ratio * 100)).padStart(3)}%`;
  let counts = options.counts === true ? ` ${done}/${total}` : '';
  let label = options.label === undefined ? '' : `${options.label} `;
  const fixed = (): number => width(label) + 1 + width(pct) + width(counts);
  if (theme.columns - fixed() < MIN_BAR) counts = '';
  if (theme.columns - fixed() < MIN_BAR && label !== '') {
    const room = theme.columns - MIN_BAR - 2 - width(pct);
    label = room < 2 ? '' : `${truncate(label.trimEnd(), room, theme.glyphs.ellipsis)} `;
  }
  const cells = Math.max(MIN_BAR, Math.min(options.cells ?? 24, theme.columns - fixed()));
  const filled = Math.round(ratio * cells);
  const bar = theme.paint.role(ratio >= 1 ? 'ok' : 'accent')(theme.glyphs.fill.repeat(filled))
    + theme.paint.role('muted')(theme.glyphs.track.repeat(cells - filled));
  return `${label}${bar} ${pct}${theme.paint.dim(counts)}`;
}
