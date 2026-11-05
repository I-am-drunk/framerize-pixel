import { fit, truncate, width } from './text.js';
import type { Theme } from './theme.js';

export interface KeyValue {
  readonly key: string;
  readonly value: string;
  /** Mark the value as secret; it renders as a fixed mask and never echoes. */
  readonly secret?: boolean;
}

/** Fixed-length Unicode mask. The length never follows the secret's length. */
export const SECRET_MASK = '••••••••';

/**
 * The fixed mask in the theme's glyph set: `••••••••` or `********`.
 * With a tick, one cell at a time dims in turn: a slow, quiet shimmer that
 * says "hidden on purpose" without ever revealing length or content.
 */
export function secretMask(theme: Theme): string {
  const cells = SECRET_MASK.length;
  const tick = theme.tick ?? 0;
  if (tick <= 0) return theme.glyphs.mask.repeat(cells);
  const lit = tick % (cells * 2);
  return Array.from({ length: cells }, (_, i) => (i === lit ? theme.paint.dim(theme.glyphs.mask) : theme.glyphs.mask)).join('');
}

/** Aligned `key  value` rows. Secrets are masked before any rendering. */
export function keyValues(theme: Theme, items: readonly KeyValue[]): string {
  const keyCells = Math.min(Math.max(0, ...items.map((i) => width(i.key))), Math.max(6, Math.floor(theme.columns / 3)));
  const mask = secretMask(theme);
  return items.map((item) => {
    const key = theme.paint.role('muted')(fit(item.key, keyCells));
    const raw = item.secret === true ? mask : item.value;
    const room = Math.max(4, theme.columns - keyCells - 2);
    return `${key}  ${truncate(raw, room, theme.glyphs.ellipsis)}`;
  }).join('\n');
}
