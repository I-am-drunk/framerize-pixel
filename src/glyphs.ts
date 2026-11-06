import { fallbackSymbols, mainSymbols } from 'figures';

/** A border set: the pieces needed to frame a box, with flush half-block edges. */
export interface Border {
  readonly tl: string; readonly tr: string; readonly bl: string; readonly br: string;
  readonly h: string; readonly hb: string; readonly v: string; readonly vr: string; readonly tee: string; readonly cross: string;
}

/**
 * A glyph set for one rendering mode. Marks are ONE cell each and come from
 * `figures` (MIT, Sindre Sorhus), the symbol set npm, Yarn, Listr and Clack
 * ship, so every state reads at a glance. The pixel identity lives in the
 * frames, rules and bars, not in the marks.
 */
export interface Glyphs {
  readonly ok: string; readonly bad: string; readonly warn: string; readonly info: string;
  readonly pending: string; readonly active: string; readonly done: string; readonly skip: string;
  readonly bullet: string; readonly pointer: string; readonly ellipsis: string;
  readonly on: string; readonly off: string; readonly fill: string; readonly track: string;
  /** One cell that stands in for each hidden character of a secret. */
  readonly mask: string;
  readonly pixel: Border; readonly rule: string;
}

/** Unicode: figures main symbols plus the original quarter-block pixel frame. */
export const unicode: Glyphs = {
  ok: mainSymbols.tick, bad: mainSymbols.cross, warn: mainSymbols.warning, info: mainSymbols.info,
  pending: mainSymbols.circleDotted, active: mainSymbols.bullet, done: mainSymbols.tick, skip: '–',
  bullet: mainSymbols.bullet, pointer: mainSymbols.pointer, ellipsis: mainSymbols.ellipsis,
  on: mainSymbols.radioOn, off: mainSymbols.radioOff, fill: '█', track: '░', mask: '•',
  pixel: { tl: '▛', tr: '▜', bl: '▙', br: '▟', h: '▀', hb: '▄', v: '▌', vr: '▐', tee: '▞', cross: '▚' },
  rule: '▔',
};

/**
 * ASCII: figures' own fallbacks where they are plain ASCII, otherwise the
 * conventional letters. Every mark stays one cell, so columns never shift
 * between the two sets.
 */
export const ascii: Glyphs = {
  ok: 'v', bad: 'x', warn: '!', info: 'i',
  pending: 'o', active: '*', done: 'v', skip: '-',
  bullet: '*', pointer: fallbackSymbols.pointer, ellipsis: '~',
  on: '(*)', off: '( )', fill: '#', track: '.', mask: '*',
  pixel: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', hb: '-', v: '|', vr: '|', tee: '+', cross: '+' },
  rule: '-',
};

export function glyphsFor(unicodeOk: boolean): Glyphs {
  return unicodeOk ? unicode : ascii;
}
