import { exitFrame, markFrame, MOTION } from './marks.js';
import type { Glyphs } from './glyphs.js';
import type { Status } from './status.js';

/**
 * Hover controller for one mark. Pointer enter arms a dwell timer; nothing
 * plays until the pointer has stayed DWELL_MS, so a fast pass never flickers.
 * Leave plays the designed exit. Re-entering mid-exit resumes the enter
 * sequence at the matching depth instead of restarting, so jitter stays smooth.
 */
export const DWELL_MS = 120;
export type HoverPhase = 'rest' | 'armed' | 'enter' | 'loop' | 'exit';

export interface Hover {
  pointerEnter(now: number): void;
  pointerLeave(now: number): void;
  /** Advance one tick (TICK_MS) and return the glyph to draw. */
  tick(now: number): string;
  readonly phase: HoverPhase;
}

export function createHover(glyphs: Glyphs, unicode: boolean, status: Status): Hover {
  const m = MOTION[status];
  let phase: HoverPhase = 'rest';
  let armedAt = 0;
  let index = 0; // frame index inside the current phase
  const draw = (): string => {
    if (phase === 'enter' || phase === 'loop') return markFrame(glyphs, unicode, status, phase === 'enter' ? index + 1 : m.enter.length + 1 + index);
    if (phase === 'exit') return exitFrame(status, index);
    return markFrame(glyphs, unicode, status, 0); // rest and armed: the plain symbol
  };
  return {
    get phase() { return phase; },
    pointerEnter(now) {
      if (phase === 'exit') { phase = 'enter'; index = Math.max(0, m.enter.length - 1 - index); return; } // resume, do not restart
      if (phase === 'rest') { phase = 'armed'; armedAt = now; }
    },
    pointerLeave(_now) {
      if (phase === 'armed') { phase = 'rest'; return; } // never dwelt long enough: nothing played, nothing exits
      if (phase === 'enter' || phase === 'loop') { phase = 'exit'; index = 0; }
    },
    tick(now) {
      if (phase === 'armed' && now - armedAt >= DWELL_MS) { phase = 'enter'; index = 0; } // first enter frame draws this tick
      const out = draw();
      if (phase === 'enter' && ++index >= m.enter.length) { phase = 'loop'; index = 0; }
      else if (phase === 'loop') index = (index + 1) % m.loop.length;
      else if (phase === 'exit' && ++index >= m.exit.length) { phase = 'rest'; index = 0; }
      return out;
    },
  };
}
