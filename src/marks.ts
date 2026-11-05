import cliSpinners from 'cli-spinners';
import type { Glyphs } from './glyphs.js';
import type { Status } from './status.js';

/**
 * Animated status marks. Frame 0 of every sequence is the resting mark, so
 * static output and snapshots never change. Motion is slow and quiet: each
 * status has its own period in ticks (one tick = TICK_MS) and rests most of
 * the time. Frames come from cli-spinners sets (MIT) reshaped to two cells.
 */
export const TICK_MS = 200;

const box = cliSpinners.boxBounce.frames;   // ▖ ▘ ▝ ▗  (one pixel orbiting)
const noise = cliSpinners.noise.frames;     // ▓ ▒ ░  (static fading)

/** Two-cell sequences for the Unicode glyph set; the first frame is the rest state. */
const unicodeFrames: Readonly<Record<Status, readonly string[]>> = {
  ok: ['▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▀▄', '▄▀', '▀▄'],
  warn: ['▞▚', '▞▚', '▞▚', '▚▞', '▚▞', '▚▞'],
  bad: ['▄▀', '▄▀', '▄▀', noise[1]! + noise[1]!, noise[2]! + noise[2]!, noise[1]! + noise[1]!],
  info: ['▌▐', '▌▐', '▌▐', '▌▐', '▐▌', '▐▌', '▐▌', '▐▌'],
  pending: ['░░', '░░', '░░', '░░', '░░', '░░', '▒░', '░▒'],
  active: [box[0]! + box[1]!, box[1]! + box[2]!, box[2]! + box[3]!, box[3]! + box[0]!],
  done: ['▓▓'],
  skip: ['··'],
};

/** ASCII sequences keep the same periods with plain characters. */
const asciiFrames: Readonly<Record<Status, readonly string[]>> = {
  ok: ['OK'], warn: ['/\\', '/\\', '/\\', '\\/', '\\/', '\\/'], bad: ['!!', '!!', '!!', '! ', ' !', '!!'],
  info: ['ii', 'ii', 'ii', 'ii', 'iI', 'Ii', 'ii', 'ii'], pending: ['..', '..', '..', '..', '..', '..', ': ', ' :'],
  active: ['|:', '/:', '-:', '\\:'], done: ['##'], skip: ['--'],
};

/** The mark for `status` at animation `tick`. Tick 0 is the static mark. */
export function markFrame(glyphs: Glyphs, unicode: boolean, status: Status, tick: number): string {
  const frames = (unicode ? unicodeFrames : asciiFrames)[status];
  return tick <= 0 ? glyphs[status] : frames[tick % frames.length] ?? glyphs[status];
}
