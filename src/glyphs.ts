/** A border set: the eight pieces needed to frame a box. */
export interface Border {
  readonly tl: string; readonly tr: string; readonly bl: string; readonly br: string;
  /** Top and bottom horizontals, left and right verticals: half blocks must sit flush with the corners. */
  readonly h: string; readonly hb: string; readonly v: string; readonly vr: string; readonly tee: string; readonly cross: string;
}

/** A glyph set: marks and borders for one rendering mode (unicode or ascii). */
export interface Glyphs {
  readonly ok: string; readonly bad: string; readonly warn: string; readonly info: string;
  readonly pending: string; readonly active: string; readonly done: string; readonly skip: string;
  readonly bullet: string; readonly pointer: string; readonly ellipsis: string;
  readonly on: string; readonly off: string; readonly fill: string; readonly track: string;
  /** One cell that stands in for each hidden character of a secret. */
  readonly mask: string;
  readonly pixel: Border; readonly rule: string;
}

/** Original pixel identity: quarter-block corners read as chunky pixels. */
export const unicode: Glyphs = {
  ok: '▀▄', bad: '▄▀', warn: '▞▚', info: '▌▐',
  pending: '░░', active: '▒▒', done: '▓▓', skip: '··',
  bullet: '▪', pointer: '▶', ellipsis: '…',
  on: '■', off: '□', fill: '█', track: '░', mask: '•',
  pixel: { tl: '▛', tr: '▜', bl: '▙', br: '▟', h: '▀', hb: '▄', v: '▌', vr: '▐', tee: '▞', cross: '▚' },
  rule: '▔',
};

/** ASCII fallback that keeps the two-cell rhythm of every mark. */
export const ascii: Glyphs = {
  ok: 'OK', bad: '!!', warn: '/\\', info: 'ii',
  pending: '..', active: '::', done: '##', skip: '--',
  bullet: '*', pointer: '>', ellipsis: '~',
  on: '[x]', off: '[ ]', fill: '#', track: '.', mask: '*',
  pixel: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', hb: '-', v: '|', vr: '|', tee: '+', cross: '+' },
  rule: '-',
};

export function glyphsFor(unicodeOk: boolean): Glyphs {
  return unicodeOk ? unicode : ascii;
}
