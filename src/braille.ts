/**
 * Braille pixel canvas. Each braille cell (U+2800..U+28FF) is a 2-wide by
 * 4-tall dot grid, so a strip of N cells is a 2N x 4 pixel canvas. This is
 * the drawille technique (also used by blessed and tplot). A sprite is four
 * strings of '#' and '.', one per pixel row; width must be even.
 */
export type Sprite = readonly [string, string, string, string];

/** Dot bit for pixel (x, y) inside one cell: the Unicode braille bit layout. */
const BIT: readonly (readonly number[])[] = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];

/** Rasterize a sprite into braille cells. Blank columns become the empty braille cell, not a space. */
export function braille(sprite: Sprite): string {
  const width = sprite[0]?.length ?? 0;
  const cells = Math.ceil(width / 2);
  let out = '';
  for (let c = 0; c < cells; c += 1) {
    let code = 0x2800;
    for (let y = 0; y < 4; y += 1) for (let dx = 0; dx < 2; dx += 1) {
      if (sprite[y]?.[c * 2 + dx] === '#') code |= BIT[y]?.[dx] ?? 0;
    }
    out += String.fromCodePoint(code);
  }
  return out;
}

/** Reveal a sprite row by row from the top; `rows` is 0 to 4. */
export function revealDown(sprite: Sprite, rows: number): Sprite {
  const blank = '.'.repeat(sprite[0]?.length ?? 0);
  return [0, 1, 2, 3].map((y) => (y < rows ? sprite[y] ?? blank : blank)) as unknown as Sprite;
}

/** Keep only pixels whose x is below `cols`: a left-to-right sweep. */
export function revealRight(sprite: Sprite, cols: number): Sprite {
  return sprite.map((row) => row.split('').map((p, x) => (x < cols ? p : '.')).join('')) as unknown as Sprite;
}
