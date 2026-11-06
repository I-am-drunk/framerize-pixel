import type { Readable } from 'node:stream';
import { createHover, type Hover } from './hover.js';
import { live } from './live.js';
import { TICK_MS } from './marks.js';
import { trackMouse, type MouseMove } from './mouse.js';
import { statusLineWith, type StatusRow } from './status.js';
import { width } from './text.js';
import type { Theme } from './theme.js';
import type { OutputStream } from './types.js';

export interface HoverBoardOptions {
  readonly input?: Readable;
  readonly output?: OutputStream;
  readonly signal?: AbortSignal;
  /** Stop after this many milliseconds. Default: run until Ctrl+C or abort. */
  readonly durationMs?: number;
}

/** One status row with its own hover machine; the mark occupies columns 1..2 of the row. */
export interface HoverRow { readonly row: StatusRow; readonly hover: Hover; frame: string; }

/** Pointer cell to row index: rows are drawn one per line under a two-line header. */
export function rowAt(move: MouseMove, rows: number, header = 2): number {
  const index = move.y - 1 - header;
  return move.x >= 1 && move.x <= 3 && index >= 0 && index < rows ? index : -1;
}

/** Render the board: header, then each row with its live hover frame in place of the mark. */
export function renderBoard(theme: Theme, rows: readonly HoverRow[], labelCells: number): string {
  const head = [theme.paint.bold('hover a mark to play its animation'), theme.paint.dim('move the pointer away for the exit, Ctrl+C to quit')];
  const lines = rows.map((r) => statusLineWith(theme, r.row, theme.paint.role('accent')(r.frame), labelCells));
  return [...head, ...lines].join('\n');
}

/**
 * Interactive hover board. Tracks the mouse, arms each mark's hover machine
 * when the pointer rests on it, and repaints through a live region every
 * tick. Resolves with 0 on timeout or 130 on Ctrl+C or abort. Non-TTY
 * streams print the resting rows once and resolve 0.
 */
export async function hoverBoard(theme: Theme, statusRows: readonly StatusRow[], options: HoverBoardOptions = {}): Promise<number> {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const unicode = theme.glyphs.pixel.tl === '▛';
  const labelCells = Math.max(...statusRows.map((r) => width(r.label)), 8);
  const rows: HoverRow[] = statusRows.map((row) => ({ row, hover: createHover(theme.glyphs, unicode, row.status), frame: '' }));
  for (const r of rows) r.frame = r.hover.tick(0);
  if (!(theme.caps.tty && output.isTTY === true && (input as { isTTY?: boolean }).isTTY === true)) {
    output.write(renderBoard(theme, rows, labelCells) + '\n');
    return 0;
  }
  return new Promise<number>((resolve) => {
    let hovered = -1;
    let code = 0;
    const region = live(theme, { stream: output, frames: [''], interval: TICK_MS, ...(options.signal === undefined ? {} : { signal: options.signal }) });
    const finish = (exit: number): void => { code = exit; tracker.stop(); clearTimeout(timer); region.done(renderBoard(theme, rows.map((r) => ({ ...r, frame: r.hover.tick(Number.MAX_SAFE_INTEGER) })), labelCells)); resolve(code); };
    const onMove = (move: MouseMove): void => {
      const now = Date.now();
      const at = rowAt(move, rows.length);
      if (at === hovered) return;
      if (hovered >= 0) rows[hovered]?.hover.pointerLeave(now);
      if (at >= 0) rows[at]?.hover.pointerEnter(now);
      hovered = at;
    };
    const tracker = trackMouse(input, output, onMove, () => finish(130));
    const timer = setTimeout(() => finish(0), options.durationMs ?? 2_147_000_000);
    timer.unref();
    region.update(() => { const now = Date.now(); for (const r of rows) r.frame = r.hover.tick(now); return renderBoard(theme, rows, labelCells); });
    options.signal?.addEventListener('abort', () => finish(130), { once: true });
  });
}
