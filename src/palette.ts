import type { Role } from './types.js';

/** One color in three depths: 16-color name, 256-color index and 24-bit RGB. */
export interface Swatch {
  readonly ansi16: string;
  readonly ansi256: number;
  readonly rgb: readonly [number, number, number];
}

/** A palette maps every role to a swatch. */
export type Palette = Readonly<Record<Role, Swatch>>;

/**
 * CRT palette: a restrained retro set. Warm phosphor accent, cool frame,
 * clear status colors. Values were chosen to stay readable on dark and
 * light backgrounds at all three depths.
 */
export const crt: Palette = {
  ink: { ansi16: 'white', ansi256: 252, rgb: [220, 220, 214] },
  muted: { ansi16: 'gray', ansi256: 244, rgb: [128, 128, 122] },
  accent: { ansi16: 'yellow', ansi256: 214, rgb: [255, 176, 0] },
  ok: { ansi16: 'green', ansi256: 114, rgb: [98, 212, 112] },
  warn: { ansi16: 'yellow', ansi256: 220, rgb: [255, 214, 68] },
  bad: { ansi16: 'red', ansi256: 203, rgb: [255, 92, 92] },
  info: { ansi16: 'cyan', ansi256: 81, rgb: [92, 200, 255] },
  frame: { ansi16: 'blue', ansi256: 67, rgb: [96, 128, 160] },
};

/** Cooler mono-green variant for a terminal-of-the-eighties feel. */
export const phosphor: Palette = {
  ink: { ansi16: 'green', ansi256: 120, rgb: [140, 255, 150] },
  muted: { ansi16: 'green', ansi256: 65, rgb: [70, 130, 80] },
  accent: { ansi16: 'greenBright', ansi256: 156, rgb: [190, 255, 140] },
  ok: { ansi16: 'greenBright', ansi256: 83, rgb: [60, 240, 90] },
  warn: { ansi16: 'yellow', ansi256: 186, rgb: [214, 214, 110] },
  bad: { ansi16: 'red', ansi256: 167, rgb: [220, 90, 90] },
  info: { ansi16: 'cyan', ansi256: 116, rgb: [120, 210, 190] },
  frame: { ansi16: 'green', ansi256: 29, rgb: [40, 110, 70] },
};
