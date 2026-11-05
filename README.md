# framerize-pixel

Retro pixel terminal styling for the Framerize CLIs. One small composable API
gives Framerize Server and Framerize Remote the same look: a restrained
palette, quarter-block pixel borders, two-cell status marks, task lists,
tables, progress bars, masked key/values, help text, a live region and
prompts that never block an agent.

Status: `0.1.0-alpha.1`, work in progress. Not published to npm.

## Install

```sh
npm install framerize-pixel
```

Node 22.12 or later. ESM only. TypeScript declarations ship in the package.

## Thirty-second tour

```ts
import { createTheme, statusRows, taskList, confirm, isCancelled } from 'framerize-pixel';

const theme = createTheme();                       // detects TTY, color depth, Unicode, width
console.log(statusRows(theme, [
  { status: 'ok', label: 'service', detail: 'running on 127.0.0.1:8788' },
  { status: 'bad', label: 'credentials', detail: 'token file missing' },
]));
const go = await confirm(theme, { message: 'Install the service?', initialValue: true });
if (isCancelled(go)) process.exit(130);           // Ctrl+C, Escape or an aborted signal
```

Run `npx framerize-pixel showcase` to see every component, `--width=40`,
`--ascii`, `--phosphor`, `--plain` or `--json` to see the fallbacks, and
`npx framerize-pixel demo` for the interactive prompts and live region.

## What it guarantees

- **Never wider than the terminal.** Every component fits `theme.columns`
  (minimum 20). Labels truncate with an ellipsis, long words hard-wrap inside
  boxes, tables shrink their widest column first. A test renders every
  component at eight widths with CJK and long inputs and fails on overflow.
- **Honest without color.** `NO_COLOR`, `TERM=dumb`, pipes and CI get plain
  text. `FORCE_COLOR` and `--color` still work. Detection follows
  supports-color 11 with `NO_COLOR` always winning.
- **ASCII when Unicode is unsafe.** `TERM=linux`, `LANG=C`, `TERM=dumb`, bare
  Windows consoles and `FRAMERIZE_PIXEL_ASCII=1` switch to two-cell ASCII
  marks and `+-|` frames.
- **Prompts never block agents.** Without a TTY on both stdin and stdout, a
  prompt returns its default or `CANCELLED` at once and writes nothing.
  `confirm` accepts `y` or `n` directly; arrows toggle; Enter submits.
- **Secrets never echo.** `secret()` masks while typing and prints a fixed
  eight-cell mask on submit. `keyValues` masks `secret: true` values before
  any width math.
- **Cleanup on every exit.** The live region and prompts restore the cursor
  and raw mode on done, abort, Ctrl+C and process exit, and remove their
  timers and listeners. PTY tests check the escape sequences.
- **JSON stays pure.** `createOutput({ mode: 'json' })` sends human text to
  stderr stripped of escapes; only `json()` reaches stdout. The live region
  follows stderr in json mode.

## API

Every renderer is `(theme, data, options?) => string`. Nothing prints by
itself; you decide where lines go.

| Function | Renders |
| --- | --- |
| `createTheme(options?)` | capabilities, palette, glyph set, painter and width for a stream |
| `plainTheme(columns?)` | no color, ASCII glyphs; the plain and JSON paths |
| `box`, `rule` | framed block with optional title; labeled horizontal rule |
| `statusRows`, `statusLine`, `mark` | `▀▄ label  detail` rows with aligned labels |
| `taskList`, `updateTask`, `taskSummary` | numbered steps with pending, active, done, failed, skipped |
| `table`, `layout` | bold header, pixel rule, right-aligned numbers, shrink to fit |
| `progress` | `label ████░░░░  58% 7/12`, drops counts then label when narrow |
| `keyValues`, `secretMask` | aligned pairs, secrets masked |
| `help` | name, usage, commands, options, examples; stacks at narrow widths |
| `live` | repainting spinner region on log-update; one line per update when piped |
| `text`, `secret`, `confirm`, `select` | prompts on @clack/core; `CANCELLED` on cancel |
| `createOutput` | routes `say`, `note`, `json` by `human`, `plain` or `json` mode |
| `width`, `truncate`, `fit`, `pad`, `wrap`, `strip` | ANSI-aware text helpers |
| `crt`, `phosphor`, `createPainter` | palettes and the role painter |
| `NAME`, `VERSION` | package identity read from package.json |

See `examples/` for a Server status screen and a Remote pairing flow, both
runnable without any real account or service.

## Built on

Behavior comes from mature packages, pinned exactly. framerize-pixel adds the
visual identity, the composable API and the safety wrapper.

ansi-styles, string-width, wrap-ansi, cli-truncate, strip-ansi, log-update,
ansi-escapes, cli-spinners and @clack/core, all MIT. Color and Unicode
detection are adapted from supports-color and is-unicode-supported (MIT),
with the changes listed in THIRD-PARTY.md. Design decisions and rejected
alternatives are in DECISIONS.md.

## Testing

`npm run check` runs typecheck, build, behavior tests and the packed-consumer
check. `npm run test:pty` drives the CLI in a real pseudo-terminal through
node-pty. `npm run captures` regenerates `captures/`, the showcase at nine
width and color combinations, for visual review. TESTING.md lists what each
layer proves and what it cannot.

## Versioning and releases

Semantic versioning with an alpha channel, tarball per CI run with
`SHA256SUMS` and the exact source identity, manual gated publication and a
rollback procedure: see docs/release.md and CHANGELOG.md.

## License

MIT. See LICENSE and THIRD-PARTY.md.
