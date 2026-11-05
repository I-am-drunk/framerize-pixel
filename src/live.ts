import ansiEscapes from 'ansi-escapes';
import cliSpinners from 'cli-spinners';
import { createLogUpdate } from 'log-update';
import type { Theme } from './theme.js';
import type { OutputStream } from './types.js';

export interface LiveOptions {
  readonly stream?: OutputStream;
  /** Spinner frames; defaults to a pixel-friendly set. */
  readonly frames?: readonly string[];
  readonly interval?: number;
  readonly signal?: AbortSignal;
}

/** A body that redraws itself per tick, so marks inside it animate. */
export type Frame = string | ((tick: number) => string);

export interface LiveRegion {
  /** Repaint with new body lines. A function body is re-rendered on every tick. */
  update(body: Frame): void;
  /** Stop, print the final text permanently, release the terminal. Idempotent. */
  done(finalText?: string): void;
  readonly active: boolean;
}

const PIXEL_FRAMES: readonly string[] = ['▖', '▘', '▝', '▗'];

/** Regions that still hide the cursor; the exit hook restores all of them. */
const hidden = new Set<OutputStream>();
let exitHooked = false;
function hideCursor(stream: OutputStream): void {
  if (!exitHooked) { exitHooked = true; process.once('exit', () => { for (const s of hidden) s.write(ansiEscapes.cursorShow); }); }
  hidden.add(stream);
  stream.write(ansiEscapes.cursorHide);
}
function showCursor(stream: OutputStream): void {
  if (hidden.delete(stream)) stream.write(ansiEscapes.cursorShow);
}

/**
 * A repainting region for progress. Non-TTY streams get one line per distinct
 * update, so logs and CI stay readable. Without an explicit stream, json mode
 * writes to stderr so stdout stays pure JSON. Cleanup always restores the
 * cursor on the same stream and removes timers and listeners, including on abort.
 */
export function live(theme: Theme, options: LiveOptions = {}): LiveRegion {
  // In json mode stdout is reserved for the machine result; progress goes to stderr.
  const stream = options.stream ?? (theme.caps.mode === 'json' ? process.stderr : process.stdout);
  const tty = theme.caps.tty && stream.isTTY === true;
  const frames = options.frames ?? (theme.caps.unicode ? PIXEL_FRAMES : cliSpinners.line.frames);
  const interval = options.interval ?? 120;
  let frame = 0;
  let body: Frame = '';
  const text = (): string => (typeof body === 'function' ? body(frame) : body);
  let active = true;
  let last = '';
  const update = tty ? createLogUpdate(stream as NodeJS.WriteStream, { showCursor: true }) : undefined;
  const render = (): string => (active ? theme.paint.role('accent')(frames[frame % frames.length] ?? '') + ' ' : '') + text();
  const paint = (): void => { if (update !== undefined) update(render()); };
  const timer = tty ? setInterval(() => { frame += 1; paint(); }, interval) : undefined;
  timer?.unref();
  if (tty) hideCursor(stream);
  const finish = (finalText?: string): void => {
    if (!active) return;
    active = false;
    if (timer !== undefined) clearInterval(timer);
    options.signal?.removeEventListener('abort', onAbort);
    const final = finalText ?? (typeof body === 'function' ? body(0) : body);
    try {
      if (update !== undefined) { update.clear(); update.done(); }
      if (final !== '') stream.write(final + '\n');
    } finally {
      if (tty) showCursor(stream);
    }
  };
  const onAbort = (): void => finish();
  if (options.signal?.aborted === true) finish();
  else options.signal?.addEventListener('abort', onAbort, { once: true });
  return {
    get active() { return active; },
    update(next: Frame) {
      if (!active) return;
      body = next;
      if (tty) { paint(); return; }
      const line = typeof next === 'function' ? next(0) : next;
      if (line !== last) { last = line; stream.write(line + '\n'); }
    },
    done: finish,
  };
}

/** Frame sets from cli-spinners, exposed for custom live regions. */
export const spinners = cliSpinners;
