import cliSpinners from 'cli-spinners';
import type { Theme } from './theme.js';

/**
 * Typing spark: when input grows, the newest cell flashes a short star
 * sequence (cli-spinners `star`, MIT) before settling into its glyph.
 * Quiet by design: four frames, 45 ms each, accent colored, one cell.
 */
export const SPARK_FRAMES: readonly string[] = cliSpinners.star.frames.slice(0, 4); // ✶ ✸ ✹ ✺
export const SPARK_ASCII: readonly string[] = ['+', 'x', '*', '+'];
export const SPARK_MS = 45;

export interface Spark {
  /** Call on every render with the current input length; returns the glyph for the newest cell, or null when idle. */
  frame(length: number, now?: number): string | null;
  /** Schedule one repaint while a spark is still running. Idempotent per frame. */
  tick(repaint: () => void): void;
  /** Cancel any pending repaint. Call on submit and cancel. */
  stop(): void;
}

export function createSpark(theme: Theme, unicode: boolean): Spark {
  const frames = unicode ? SPARK_FRAMES : SPARK_ASCII;
  let lastLength = 0;
  let since = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    frame(length, now = Date.now()) {
      if (length > lastLength) since = now;
      lastLength = length;
      const index = Math.floor((now - since) / SPARK_MS);
      return length > 0 && index >= 0 && index < frames.length ? theme.paint.role('accent')(frames[index] ?? '') : null;
    },
    tick(repaint) {
      if (timer !== undefined) return;
      timer = setTimeout(() => { timer = undefined; repaint(); }, SPARK_MS);
      timer.unref?.();
    },
    stop() { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } },
  };
}
