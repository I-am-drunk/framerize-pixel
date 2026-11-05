# Testing

Each layer proves one thing. None of them proves the layer above it.

| Command | Proves | Cannot prove |
| --- | --- | --- |
| `npm run typecheck` | source types under strict settings | shipped declarations work for consumers |
| `npm test` | behavior of every component with injected streams and env: capability precedence, width budgets at 20 to 132 columns with CJK and long input, truncation, wrapping, painter balance, masking, output routing, non-interactive prompt defaults, live region on fake TTY and pipe | real terminal behavior |
| `npm run test:pty` | the CLI inside a real pseudo-terminal through node-pty: color codes under xterm-256color, `NO_COLOR` and `TERM=dumb` fallbacks, no line wider than the PTY, `y` submits confirm, secrets never echo, Ctrl+C exits 130 with the cursor shown, json mode keeps stdout pure | Windows ConPTY (job skipped there) |
| `npm run test:pack` | `npm pack` bytes install into a clean consumer, import, render, type-check against the shipped `.d.ts` with `@ts-expect-error` guard, and the bin prints its version | behavior inside Framerize |
| `npm run captures` | deterministic showcase text at nine width and color combinations for visual review | pixel rendering of a given terminal font |

## Synthetic state only

Tests and examples use fixed strings such as `synthetic-not-real`. No test
reads a real profile, token or account file. PTY tests spawn the CLI with a
minimal environment (`PATH`, `HOME`, `TERM`, `LANG`) and a 20-second kill timer.

## Platform notes

- Linux is observed in this repository's receipts. macOS and Windows jobs run
  in CI only; Windows skips the PTY job.
- `width()` follows string-width 8 and the terminal may disagree on emoji
  sequences in older fonts. The width test covers CJK and combining marks.
- Captures are text. Fonts render the half-block glyphs with visible seams in
  some terminals; the ASCII set avoids that where it matters.
