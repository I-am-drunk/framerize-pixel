# Changelog

All notable changes to framerize-pixel. The format follows Keep a Changelog and
the project follows Semantic Versioning (see docs/release.md).

## [Unreleased]

### Changed

- Package renamed from `pixelterm` to `framerize-pixel`; bin is `framerize-pixel`,
  the ASCII override is `FRAMERIZE_PIXEL_ASCII`. Migration: update imports and the bin name.
- Box frames use the lower-half block on the bottom edge and the right-half
  block on the right edge so all four sides sit flush with the corners.
- Help stacks summaries under names when fewer than 16 cells remain, and wraps usage lines.

### Fixed

- Progress bar drops counts, then shortens the label, so it never exceeds the width.
- Status rows and task rows never exceed the width; task rows budget for the step counter.
- One-cell truncation keeps the first narrow glyph instead of returning nothing.
- Wrapped lines keep first-line indentation and never start with a separator space.
- Key/value and prompt masks follow the theme glyph set (`•` or `*`), not detection.
- Live region hides and shows the cursor on the stream it paints, restores it on
  process exit, and writes to stderr in json mode so stdout stays pure JSON.

### Added

- `confirm` shows the `y/n, arrows, enter` hint; `y` and `n` submit at once.
- Animated marks: `withTick(theme, n)` draws frame `n` of every status mark,
  task row and secret mask; frame 0 is the resting glyph. `live` accepts a
  per-tick frame function. `framerize-pixel showcase --live[=seconds]` shows
  the animated board. Frames come from cli-spinners sets (`boxBounce`). No frame
  of one status looks like another status, so NO_COLOR rows stay readable mid-animation.
- Width-invariant test at eight widths; PTY tests through node-pty; examples
  for Server status and Remote pairing; README, TESTING.md, release workflow.

## [0.1.0-alpha.1] - 2026-11-05

### Added

- Capability detection: TTY, color level, Unicode, columns, CI, output mode.
- Palettes `crt` and `phosphor`; role-based painter on ansi-styles.
- Pixel glyph set with a two-cell ASCII fallback.
- Components: box, rule, status rows, task list, table, progress,
  key/value with secret masking, help.
- Live region on log-update with abort and cursor restore.
- Prompts on @clack/core: text, secret, confirm, select; non-interactive
  defaults so agents never block.
- Output router for human, plain and JSON modes.
- CLI: `framerize-pixel showcase|demo|version`.
