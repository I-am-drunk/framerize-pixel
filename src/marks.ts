import { braille, revealDown, revealRight, type Sprite } from './braille.js';
import type { Glyphs } from './glyphs.js';
import type { Status } from './status.js';
import * as S from './sprites.js';

/**
 * Animated status marks on a 4x4 braille pixel canvas (two cells).
 * Each status has ENTER (plays once when the mark appears or is hovered),
 * LOOP (repeats quietly while resting) and EXIT (designed, not a reversed
 * enter). Tick 0 is the resting sprite, so static output never moves.
 */
export const TICK_MS = 120;

export interface Motion { readonly enter: readonly Sprite[]; readonly loop: readonly Sprite[]; readonly exit: readonly Sprite[]; readonly rest: Sprite; }

const hold = (sprite: Sprite, n: number): Sprite[] => Array.from({ length: n }, () => sprite);

/** Check: sweeps in, bobs, settles. Exit: lifts, breaks into dots, one floats off the top. */
const ok: Motion = {
  rest: S.CHECK,
  enter: [revealRight(S.CHECK, 1), revealRight(S.CHECK, 2), revealRight(S.CHECK, 3), S.CHECK, S.CHECK_HIGH, S.CHECK],
  loop: [...hold(S.CHECK, 22), S.CHECK_HIGH, S.CHECK, S.CHECK_HIGH],
  exit: [S.CHECK_HIGH, S.CHECK_LIFT, S.CHECK_DUST, S.DOT_TOP, S.EMPTY],
};
/** Cross: two strikes, then the X. Exit: collapses to its core, a spark, gone. */
const bad: Motion = {
  rest: S.CROSS,
  enter: [S.STROKE_A, S.STROKE_A, S.CROSS, S.CROSS, S.STROKE_B, S.CROSS],
  loop: [...hold(S.CROSS, 14), S.STROKE_A, S.CROSS, S.STROKE_B, S.CROSS],
  exit: [S.CROSS, S.CROSS_CORE, S.CROSS_SPARK, S.EMPTY],
};
/** Triangle: draws down from the apex, the mark lands last. Exit: sinks row by row, base line last. */
const warn: Motion = {
  rest: S.TRIANGLE_DOT,
  enter: [revealDown(S.TRIANGLE, 1), revealDown(S.TRIANGLE, 2), revealDown(S.TRIANGLE, 3), S.TRIANGLE, S.TRIANGLE, S.TRIANGLE_DOT],
  loop: [...hold(S.TRIANGLE_DOT, 10), S.TRIANGLE, S.TRIANGLE, S.TRIANGLE_DOT],
  exit: [S.TRIANGLE, S.TRI_NO_APEX, S.TRI_BASE, S.TRI_LINE, S.EMPTY],
};
/** Info: the i drops in from the top. Exit: drops out the bottom. */
const info: Motion = {
  rest: S.INFO,
  enter: [revealDown(S.INFO, 1), revealDown(S.INFO, 2), revealDown(S.INFO, 3), S.INFO],
  loop: [S.INFO],
  exit: [S.INFO_LOW, S.INFO_DOT, S.EMPTY],
};
/** Pending: one dot walks the ring slowly. Exit: the dot stops, fades. */
const pending: Motion = {
  rest: S.ringDot(0),
  enter: [S.ringDot(0)],
  loop: [0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => hold(S.ringDot(i), 2)),
  exit: [S.ringDot(0), S.EMPTY],
};
/** Active: a ring with a rotating gap, the boot-spinner look. Exit: the gap widens until nothing is left. */
const active: Motion = {
  rest: S.ringGap(0),
  enter: [S.ringGap(0)],
  loop: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => S.ringGap(i)),
  exit: [S.ringGap(0, 4), S.ringGap(0, 6), S.ringGap(0, 7), S.EMPTY],
};
/** Done: the ring closes into a check. Exit: same as ok. */
const done: Motion = {
  rest: S.CHECK,
  enter: [S.ringGap(0, 2), S.ringGap(0, 1), S.RING, S.RING, revealRight(S.CHECK, 2), S.CHECK],
  loop: [S.CHECK],
  exit: ok.exit,
};
const skip: Motion = { rest: S.SKIP, enter: [S.SKIP], loop: [S.SKIP], exit: [S.SKIP, S.EMPTY] };

export const MOTION: Readonly<Record<Status, Motion>> = { ok, bad, warn, info, pending, active, done, skip };

/** The resting mark: the glyph set's one-cell symbol padded to two cells. Crisp at rest; pixels only in motion. */
export function restingMark(glyphs: Glyphs, status: Status): string {
  return glyphs[status].padEnd(2);
}

/**
 * The mark for `status` at animation `tick`. Tick 0 is the resting symbol.
 * Ticks 1..enter.length play the braille enter sequence, whose last frame
 * snaps to the symbol; later ticks cycle the loop, where the resting sprite
 * also draws as the symbol. ASCII glyph sets never animate.
 */
export function markFrame(glyphs: Glyphs, unicode: boolean, status: Status, tick: number): string {
  if (!unicode || tick <= 0) return restingMark(glyphs, status);
  const { enter, loop, rest } = MOTION[status];
  const sprite = tick <= enter.length ? enter[tick - 1] : loop[(tick - enter.length - 1) % loop.length];
  return sprite === undefined || sprite === rest ? restingMark(glyphs, status) : braille(sprite);
}

/** Frame `index` of the exit sequence; past the end returns the empty cell pair. */
export function exitFrame(status: Status, index: number): string {
  const { exit } = MOTION[status];
  return braille(exit[Math.min(index, exit.length - 1)] ?? S.EMPTY);
}
