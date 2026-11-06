import ansiStyles from 'ansi-styles';
import type { Palette, Swatch } from './palette.js';
import type { ColorLevel, Role } from './types.js';

/** Paints text for one role at one color depth. No color means identity. */
export type Paint = (text: string) => string;

export interface Painter {
  readonly level: ColorLevel;
  readonly role: (role: Role) => Paint;
  readonly bold: Paint;
  readonly dim: Paint;
  readonly inverse: Paint;
  readonly underline: Paint;
}

type NamedColor = keyof typeof ansiStyles.color & string;

function open(swatch: Swatch, level: ColorLevel): string {
  if (level >= 3) return ansiStyles.color.ansi16m(...swatch.rgb);
  if (level === 2) return ansiStyles.color.ansi256(swatch.ansi256);
  const named = ansiStyles.color[swatch.ansi16 as NamedColor];
  return typeof named === 'object' && named !== null && 'open' in named ? named.open : '';
}

function wrapWith(openCode: string, closeCode: string): Paint {
  return (text) => (text === '' ? '' : `${openCode}${text.split(closeCode).join(closeCode + openCode)}${closeCode}`);
}

const identity: Paint = (text) => text;

/** Build a painter. Styles compose: `p.bold(p.role('ok')('x'))` stays balanced. */
export function createPainter(palette: Palette, level: ColorLevel): Painter {
  const cache = new Map<Role, Paint>();
  const role = (name: Role): Paint => {
    if (level === 0) return identity;
    let paint = cache.get(name);
    if (!paint) { paint = wrapWith(open(palette[name], level), ansiStyles.color.close); cache.set(name, paint); }
    return paint;
  };
  const mod = (m: { open: string; close: string }): Paint => (level === 0 ? identity : wrapWith(m.open, m.close));
  return { level, role, bold: mod(ansiStyles.bold), dim: mod(ansiStyles.dim), inverse: mod(ansiStyles.inverse), underline: mod(ansiStyles.underline) };
}
