import type { Sprite } from './braille.js';

/**
 * Pixel art for every status on a 4x4 braille canvas (two cells). Drawn as
 * text so the shapes are reviewable here. '#' is a lit dot.
 */
export const CHECK: Sprite = [
  '....',
  '...#',
  '#.#.',
  '.#..',
];
export const CHECK_HIGH: Sprite = [ // the check lifted one row: the "wave" frame
  '...#',
  '#.#.',
  '.#..',
  '....',
];
export const CROSS: Sprite = [
  '#..#',
  '.##.',
  '.##.',
  '#..#',
];
export const STROKE_A: Sprite = ['#...', '.#..', '..#.', '...#']; // first strike  \
export const STROKE_B: Sprite = ['...#', '..#.', '.#..', '#...']; // second strike /
export const TRIANGLE: Sprite = [
  '.##.',
  '#..#',
  '#..#',
  '####',
];
export const TRIANGLE_DOT: Sprite = [ // triangle with its center mark lit
  '.##.',
  '####',
  '#..#',
  '####',
];
export const INFO: Sprite = ['.##.', '....', '.##.', '.##.'];
export const SKIP: Sprite = ['....', '....', '####', '....'];

/** Ring: a 4x4 circle outline. Twelve perimeter pixels, clockwise from the top-left. */
export const RING: Sprite = ['.##.', '#..#', '#..#', '.##.'];
const PERIMETER: readonly (readonly [number, number])[] = [
  [1, 0], [2, 0], [3, 1], [3, 2], [2, 3], [1, 3], [0, 2], [0, 1],
];
/** A ring with a gap of `gap` pixels starting at perimeter index `at`: the rotating boot spinner. */
export function ringGap(at: number, gap = 3): Sprite {
  const rows = RING.map((r) => r.split(''));
  for (let i = 0; i < gap; i += 1) {
    const [x, y] = PERIMETER[(at + i) % PERIMETER.length] ?? [0, 0];
    const row = rows[y];
    if (row) row[x] = '.';
  }
  return rows.map((r) => r.join('')) as unknown as Sprite;
}
/** A single lit pixel orbiting the ring: the quiet pending state. */
export function ringDot(at: number): Sprite {
  const rows = ['....', '....', '....', '....'].map((r) => r.split(''));
  const [x, y] = PERIMETER[at % PERIMETER.length] ?? [0, 0];
  const row = rows[y];
  if (row) row[x] = '#';
  return rows.map((r) => r.join('')) as unknown as Sprite;
}

/** Exit frames: designed, not reversed enters. */
export const CHECK_LIFT: Sprite = ['..#.', '#.#.', '.#..', '....'];   // the check lifts
export const CHECK_DUST: Sprite = ['.#.#', '#...', '....', '....'];   // and breaks into dots
export const DOT_TOP: Sprite = ['..#.', '....', '....', '....'];      // one dot floats off
export const CROSS_CORE: Sprite = ['....', '.##.', '.##.', '....'];   // the X collapses inward
export const CROSS_SPARK: Sprite = ['....', '..#.', '.#..', '....'];  // to a spark
export const TRI_NO_APEX: Sprite = ['....', '####', '#..#', '####'];  // the triangle sinks
export const TRI_BASE: Sprite = ['....', '....', '####', '####'];     // row by row
export const TRI_LINE: Sprite = ['....', '....', '....', '####'];     // its base line goes last
export const INFO_LOW: Sprite = ['....', '.##.', '....', '.##.'];     // the i drops out the bottom
export const INFO_DOT: Sprite = ['....', '....', '....', '.##.'];
export const EMPTY: Sprite = ['....', '....', '....', '....'];
