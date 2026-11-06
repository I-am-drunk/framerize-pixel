# Third-party code and packages

framerize-pixel is an amalgamation. Behavior comes from these packages, pinned
exactly in package.json and package-lock.json. Visual design is original.

## Runtime dependencies

| Package | Version | License | Role in framerize-pixel |
| --- | --- | --- | --- |
| ansi-styles | 7.0.0 | MIT | SGR open/close codes, 256 and 24-bit color codes |
| string-width | 8.3.0 | MIT | display width (graphemes, East Asian width, combining) |
| wrap-ansi | 10.0.2 | MIT | style-preserving word wrap |
| cli-truncate | 6.2.0 | MIT | style-preserving truncation with ellipsis |
| strip-ansi | 7.2.0 | MIT | escape removal for plain and JSON output |
| log-update | 8.0.0 | MIT | live region repaint, cursor hide/show, line erase |
| ansi-escapes | 7.3.0 | MIT | cursor show for failure recovery |
| cli-spinners | 3.4.0 | MIT | spinner frame sets and intervals |
| @clack/core | 1.5.1 | MIT | prompt state machines, raw mode, cursor restore, AbortSignal |
| figures | 6.1.0 | MIT | resting status symbols (tick, cross, warning, info, bullet, pointer) with Windows fallbacks |

## Adapted source (copied with changes into this repository)

- `src/capabilities.ts` adapts the color-level precedence from
  supports-color 11.0.0 (MIT, Sindre Sorhus): FORCE_COLOR parsing,
  --color flags, TERM=dumb, CI vendors, COLORTERM, TERM_PROGRAM and TERM
  pattern checks. Changes: NO_COLOR is applied before every other signal,
  the environment and platform are injected for tests, and Windows is
  treated as 24-bit because Node 22 requires Windows 10 1703 or later.
- `src/capabilities.ts` adapts the Unicode heuristics from
  is-unicode-supported 2.1.0 (MIT, Sindre Sorhus) with the same inputs
  injected, plus LANG=C and LC_ALL=C/POSIX treated as ASCII.

- `src/braille.ts` implements the braille 2x4 dot-canvas technique known from
  drawille (MIT, Adam Tauber) and blessed; no code was copied, only the
  Unicode braille bit layout, which is part of the Unicode standard.

Both upstream licenses are MIT; the license text is identical to LICENSE
with the upstream copyright holder. No T3 Code source was copied.
T3 Code (MIT, T3 Tools Inc., commit fbe5df2d) informed only the test
approach: node-pty driven PTY tests and injectable process state.
