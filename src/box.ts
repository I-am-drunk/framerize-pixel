import { fit, truncate, width, wrap } from './text.js';
import type { Theme } from './theme.js';
import type { Role } from './types.js';

export interface BoxOptions {
  readonly title?: string;
  readonly role?: Role;
  /** Total width in cells. Defaults to the theme width, capped at 72. */
  readonly width?: number;
  readonly padding?: 0 | 1;
}

/** A framed block. Lines wrap inside; the frame never exceeds the width. */
export function box(theme: Theme, body: string | readonly string[], options: BoxOptions = {}): string {
  const { pixel } = theme.glyphs;
  const frame = theme.paint.role(options.role ?? 'frame');
  const total = Math.max(8, Math.min(options.width ?? Math.min(theme.columns, 72), theme.columns));
  const pad = options.padding ?? 1;
  const inner = total - 2 - pad * 2;
  const lines = (Array.isArray(body) ? body : String(body).split('\n')).flatMap((l) => wrap(String(l), inner));
  const side = ' '.repeat(pad);
  const top = options.title === undefined ? pixel.h.repeat(total - 2) : titleBar(theme, options.title, total - 2);
  const out = [frame(pixel.tl + top + pixel.tr)];
  for (const line of lines) out.push(frame(pixel.v) + side + fit(line, inner) + side + frame(pixel.vr));
  out.push(frame(pixel.bl + pixel.hb.repeat(total - 2) + pixel.br));
  return out.join('\n');
}

function titleBar(theme: Theme, title: string, cells: number): string {
  const { pixel } = theme.glyphs;
  const label = ` ${fit(title, Math.max(1, cells - 4))} `.replace(/\s+$/, ' ');
  const used = width(label);
  return pixel.h + theme.paint.bold(label) + pixel.h.repeat(Math.max(0, cells - used - 1));
}

/** A horizontal rule with an optional label, in the frame role. */
export function rule(theme: Theme, label?: string, cells = theme.columns): string {
  const frame = theme.paint.role('frame');
  const bar = theme.glyphs.rule;
  if (label === undefined) return frame(bar.repeat(cells));
  const text = ` ${truncate(label, Math.max(1, cells - 6), theme.glyphs.ellipsis)} `;
  const rest = Math.max(0, cells - width(text) - 2);
  return frame(bar.repeat(2)) + theme.paint.bold(text) + frame(bar.repeat(rest));
}
