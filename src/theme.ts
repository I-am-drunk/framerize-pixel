import { detect } from './capabilities.js';
import { glyphsFor, type Glyphs } from './glyphs.js';
import { crt, type Palette } from './palette.js';
import { createPainter, type Painter } from './style.js';
import type { Capabilities, DetectOptions } from './types.js';

/** Everything a component needs to render: data plus a painter. */
export interface Theme {
  readonly caps: Capabilities;
  readonly palette: Palette;
  readonly glyphs: Glyphs;
  readonly paint: Painter;
  /** True when `glyphs` is the Unicode set. Masks and spinners follow this. */
  readonly unicode: boolean;
  /** Usable width. Components never exceed it. Minimum 20. */
  readonly columns: number;
  /** Animation tick for marks. Absent or 0 draws the resting mark. */
  readonly tick?: number;
}

export interface ThemeOptions extends DetectOptions {
  readonly palette?: Palette;
  /** Force glyph set regardless of detection. */
  readonly ascii?: boolean;
}

export const MIN_COLUMNS = 20;

/** Build a theme for a stream. Pure for the same inputs; cheap to call. */
export function createTheme(options: ThemeOptions = {}): Theme {
  const caps = detect(options);
  const palette = options.palette ?? crt;
  const unicode = options.ascii === true ? false : caps.unicode;
  return {
    caps,
    palette,
    glyphs: glyphsFor(unicode),
    unicode,
    paint: createPainter(palette, caps.color),
    columns: Math.max(MIN_COLUMNS, caps.columns),
  };
}

/** Theme with no color and ASCII glyphs; used for plain and JSON paths. */
export function plainTheme(columns = 80): Theme {
  return createTheme({ env: {}, argv: [], platform: 'linux', mode: 'plain', ascii: true, columns, stream: { isTTY: false } as never });
}

/** The same theme at animation tick `tick`; every component that draws marks animates. */
export function withTick(theme: Theme, tick: number): Theme {
  return { ...theme, tick: Math.max(0, Math.floor(tick)) };
}
