import stringWidth from 'string-width';
import cliTruncate from 'cli-truncate';
import wrapAnsi from 'wrap-ansi';
import stripAnsi from 'strip-ansi';

export type Align = 'left' | 'right' | 'center';

/** Display width in terminal cells. Ignores escapes, counts wide glyphs as 2. */
export function width(text: string): number {
  return stringWidth(text);
}

/** Remove every ANSI escape sequence. Plain and JSON paths rely on this. */
export function strip(text: string): string {
  return stripAnsi(text);
}

/** Pad with spaces to `cells` display cells. Never truncates. */
export function pad(text: string, cells: number, align: Align = 'left'): string {
  const gap = Math.max(0, cells - width(text));
  if (gap === 0) return text;
  if (align === 'right') return ' '.repeat(gap) + text;
  if (align === 'center') {
    const left = Math.floor(gap / 2);
    return ' '.repeat(left) + text + ' '.repeat(gap - left);
  }
  return text + ' '.repeat(gap);
}

/** Truncate to `cells` display cells with a one-cell ellipsis when needed. One cell keeps the first narrow glyph. */
export function truncate(text: string, cells: number, ellipsis = '…'): string {
  if (cells <= 0) return '';
  if (cells === 1) {
    if (width(text) <= 1) return text;
    const first = [...new Intl.Segmenter().segment(strip(text))][0]?.segment ?? '';
    return width(first) === 1 ? first : '';
  }
  return cliTruncate(text, cells, { truncationCharacter: ellipsis });
}

/** Pad or truncate so the result is exactly `cells` wide. Safe for columns. */
export function fit(text: string, cells: number, align: Align = 'left', ellipsis = '…'): string {
  return pad(truncate(text, cells, ellipsis), cells, align);
}

/**
 * Word-wrap keeping styles across lines. Hard-breaks words wider than `cells`.
 * Leading spaces on the first line are kept (indentation); continuation lines
 * never start with the separator space, and trailing spaces are removed.
 */
export function wrap(text: string, cells: number): string[] {
  const indent = /^ */.exec(text)?.[0] ?? '';
  // Tabs become one space (terminals disagree on tab stops). A combining mark or
  // joiner after a space is a zero-width "word" that defeats trailing-space
  // trimming inside wrap-ansi, so drop the spaces it would ride on.
  const body = text.slice(indent.length).replace(/\t/g, ' ').replace(/ +(?=[\p{M}\u200d])/gu, '');
  const wrapped = wrapAnsi(body, Math.max(1, cells - indent.length), { hard: true, trim: true });
  return wrapped.split('\n').map((line, i) => (i === 0 ? indent + line : line).replace(/ +$/, ''));
}
