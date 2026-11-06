import type { Readable } from 'node:stream';
import type { OutputStream } from './types.js';

/**
 * Terminal mouse tracking in SGR 1006 encoding with any-motion reporting
 * (modes 1003 and 1006; supported by xterm, Windows Terminal, iTerm2, kitty,
 * WezTerm, Ghostty, VS Code). Reports arrive on stdin as `ESC [ < b ; x ; y M`.
 * Positions are 1-based cells. Everything is disabled again on stop().
 */
export const MOUSE_ON = '\u001b[?1003h\u001b[?1006h';
export const MOUSE_OFF = '\u001b[?1006l\u001b[?1003l';

export interface MouseMove { readonly x: number; readonly y: number; readonly button: number; readonly release: boolean; }

const SGR = /\u001b\[<(\d+);(\d+);(\d+)([mM])/g;

/** Parse every SGR mouse report in a chunk; `rest` is any trailing partial report to keep for the next chunk. */
export function parseMouse(chunk: string): { readonly moves: MouseMove[]; readonly rest: string } {
  const moves: MouseMove[] = [];
  let last = 0;
  for (const m of chunk.matchAll(SGR)) {
    moves.push({ button: Number(m[1]), x: Number(m[2]), y: Number(m[3]), release: m[4] === 'm' });
    last = m.index + m[0].length;
  }
  const tail = chunk.slice(last);
  const partial = tail.lastIndexOf('\u001b[<');
  return { moves, rest: partial === -1 ? '' : tail.slice(partial) };
}

export interface MouseTracker {
  /** Stop tracking, restore the terminal modes and detach the listener. Idempotent. */
  stop(): void;
  readonly active: boolean;
}

/**
 * Start mouse tracking on a TTY pair. Each report calls `onMove`. Returns an
 * inactive tracker (no escapes written) when either stream is not a TTY.
 * Ctrl+C (0x03) in raw input calls `onInterrupt` so callers can stop cleanly.
 */
export function trackMouse(input: Readable, output: OutputStream, onMove: (move: MouseMove) => void, onInterrupt?: () => void): MouseTracker {
  const inTty = (input as { isTTY?: boolean }).isTTY === true;
  if (!inTty || output.isTTY !== true) return { stop() {}, active: false };
  let active = true;
  let rest = '';
  const onData = (data: Buffer | string): void => {
    const text = rest + String(data);
    if (text.includes('\u0003')) { onInterrupt?.(); return; }
    const parsed = parseMouse(text);
    rest = parsed.rest;
    for (const move of parsed.moves) onMove(move);
  };
  const raw = input as Readable & { setRawMode?: (on: boolean) => void };
  raw.setRawMode?.(true);
  input.setEncoding('utf8');
  input.on('data', onData);
  input.resume();
  output.write(MOUSE_ON);
  return {
    get active() { return active; },
    stop() {
      if (!active) return;
      active = false;
      output.write(MOUSE_OFF);
      input.off('data', onData);
      raw.setRawMode?.(false);
      input.pause();
    },
  };
}
