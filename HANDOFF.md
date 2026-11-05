# Handoff: framerize-pixel 0.1.0-alpha.1 candidate

Work in progress. Built in /tmp/framerize-pixel-library-20261105 on Linux
and pushed to branch `wip/pixel-library-20261105` of
https://github.com/I-am-drunk/framerize-pixel. Not published to npm.

## What is done

- Source: 19 modules under `src/`, strict TypeScript, ESM, explicit public types.
- Components: box, rule, status rows, tasks, table, progress, key/values,
  help, live region, prompts (text, secret, confirm, select), output router.
- CLI: `framerize-pixel showcase|demo|version` with `--json`, `--plain`,
  `--ascii`, `--phosphor`, `--width=N`.
- Examples: `examples/server-status.mjs`, `examples/remote-pair.mjs`.
- Tests: 42 behavior tests, 7 showcase snapshots, 6 PTY tests through node-pty, packed-consumer
  check with type-check of shipped declarations, nine captures.
- Docs: README, TESTING, DECISIONS, THIRD-PARTY, CHANGELOG, docs/release.md.
- CI: `ci.yml` matrix (ubuntu, windows, macos; Node 22.12 and 24) plus a
  tarball artifact with SHA256SUMS; `release.yml` on `v*` tags.

## Evidence (Linux, this machine)

| Check | Node 22.23.4 | Node 24.13.0 |
| --- | --- | --- |
| `npm test` (behavior + snapshots) | 49 pass, 0 fail | 49 pass, 0 fail |
| `npm run test:pty` | 6 pass, 0 fail | 6 pass, 0 fail |
| `npm run test:pack` | ok, 49 files | ok, 49 files |
| tarball sha256 | 46f73099bec6c4a6… | identical |

Raw logs and JSON receipts live in the sibling evidence directory
/tmp/framerize-pixel-recovery-20261105 (not part of the repository).

## Open items

- Windows and macOS have not run anywhere yet; the CI matrix covers them
  once the branch has a pull request. Windows skips the PTY job.
- No release tag exists. `release.yml` is untested until the first `v*` tag.
- Framerize integration is out of scope here: Server and Remote still use
  their own output code. The examples show the intended calls.
- Two adversarial reviews are planned by the parent after this candidate.

## Known limits

- Half-block borders show seams in some terminal fonts. The ASCII set is
  one flag away (`--ascii`, `FRAMERIZE_PIXEL_ASCII=1`, `ascii: true`).
- The live region repaints at the spinner interval (120 ms default) and
  wraps each repaint in synchronized-output escapes through log-update, so
  terminals that support them never show a torn frame. Terminals without
  that support may flicker on very slow links.
- `width()` can disagree with a terminal on new emoji sequences.

## How to verify from a clean checkout

```sh
npm ci && npm run check && npm run test:pty && npm run captures
```
