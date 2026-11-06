# framerize-pixel design decisions

framerize-pixel is the retro pixel terminal styling library for the Framerize
CLIs. It carries the Framerize look so Server and Remote share one visual
language. Styling stays separate from commands, credentials and networking.

## Amalgamation, not reinvention

Each mature piece is reused as a package. framerize-pixel adds only the visual
identity, the composable API and the safety wrapper around them.

| Need | Package | Version | License | Why this one |
| --- | --- | --- | --- | --- |
| Color level detection | supports-color | 11.0.0 | MIT | chalk's detector: NO_COLOR, FORCE_COLOR, TERM=dumb, CI, Windows |
| SGR codes, 256/16m conversion | ansi-styles | 7.0.0 | MIT | chalk's tables; no string wrapper overhead |
| Display width | string-width | 8.3.0 | MIT | graphemes, East Asian width, combining marks |
| Word wrap | wrap-ansi | 10.0.2 | MIT | preserves styles across wrapped lines |
| Truncate | cli-truncate | 6.2.0 | MIT | ANSI-aware slicing with ellipsis control |
| Live region | log-update | 8.0.0 | MIT | cursor hide/show, line erase, resize-safe |
| Spinner frames | cli-spinners | 3.4.0 | MIT | curated frame sets with intervals |
| Prompt state machines | @clack/core | 1.5.1 | MIT | raw mode, cursor restore, AbortSignal |
| Unicode detection | is-unicode-supported | 2.1.0 | MIT | sindresorhus heuristics for Windows/TERM |
| Strip escapes | strip-ansi | 7.2.0 | MIT | plain and JSON paths must stay clean |
| Cursor and erase codes | ansi-escapes | 7.3.0 | MIT | already a log-update dependency |
| Resting status symbols | figures | 6.1.0 | MIT | the ✔ ✖ ⚠ ℹ set npm, Yarn, Listr and Clack ship; Windows fallbacks included |

## Marks: crisp at rest, pixels in motion

Resting marks are one standard symbol from figures. Half-block pairs were
tried first and read as nothing. Motion uses a 4x4 braille pixel canvas per
mark (two cells): enter and exit sequences are designed per state, the last
enter frame snaps to the symbol, and the exit is never the enter reversed.
Hover arms a 120 ms dwell before anything plays; a fast pass never flickers.

Rejected: ink (React reconciler plus yoga layout for a styling library is
too heavy), @clack/prompts (its visual identity is the thing being replaced),
cli-boxes (border sets are the original design here), chalk (ansi-styles
gives the same tables without a second API).
