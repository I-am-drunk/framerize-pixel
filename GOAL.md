# Goal: Framerize Pixel library candidate (implementation and qualification)

Owner: Fable 5.1 implementation child (shared mode, artifact dir only).
Created: 2026-11-05. Status: active until the candidate is immutable.

Objective: research, implement and qualify `framerize-pixel`, a standalone
retro pixel terminal styling library for Framerize Server and Remote, built
on mature terminal packages, with tests, captures and release workflows.

Scope: this directory only. No Git checkout, no Framerize edits, no npm
publish, no global package changes, no live accounts or services.

Steps:
1. Research mature libraries and T3 source; record provenance. (done)
2. Decide architecture and dependency set; write DECISIONS.md.
3. Implement src/ with explicit public types and a small composable API.
4. Write examples (Server and Remote workflows) and the interactive showcase.
5. Tests: unit, capability detection, snapshots at widths/color modes,
   PTY tests, packed-package consumer install, exported types, version output.
6. Release: semver policy, changelog, alpha channel, CI, tarball per PR.
7. Freeze the candidate: hashes, receipts, limits, handoff report.

Acceptance of the overall library and Framerize integration still require
the parent's two Astra reviews; this goal covers only the candidate.
