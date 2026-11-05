# Release policy

## Semantic versioning

- `MAJOR`: a public type or function in `src/index.ts` changes shape, a
  rendered line changes for the same inputs in `plain` mode, or Node support drops.
- `MINOR`: new component, option or palette. Existing output is unchanged.
- `PATCH`: bug fix with a regression test. Visual fixes that change human
  mode output only are patches when the plain output is unchanged.
- Before 1.0.0 the alpha channel may break between minors; each break is
  listed under "Changed" in CHANGELOG.md with a migration line.

## Channels

- `alpha`: versions like `0.1.0-alpha.N`, published with `--tag alpha`.
- `latest`: stable versions only. Promotion copies an existing tarball; it
  never rebuilds. Rebuilding would change the source identity.

## Procedure (manual, gated)

1. Update CHANGELOG.md and bump `version` in package.json in one commit.
2. Tag `vX.Y.Z` or `vX.Y.Z-alpha.N`. CI builds, tests and packs that tag and
   uploads `framerize-pixel-<version>.tgz`, `SHA256SUMS` and `build-info.json`.
3. Download the artifact, verify `sha256sum -c SHA256SUMS`, then publish the
   same bytes from a maintainer machine: `npm publish framerize-pixel-<version>.tgz
   --tag alpha` or `--tag latest`. No npm token exists in CI.
4. Promotion from alpha to stable: `npm dist-tag add framerize-pixel@X.Y.Z latest`
   after the alpha tarball has been exercised by at least one consumer.

## Rollback

- Move the dist-tag back: `npm dist-tag add framerize-pixel@<previous> latest`.
- Deprecate the bad version with the reason: `npm deprecate framerize-pixel@X.Y.Z "..."`.
- Never unpublish a version that had consumers for more than an hour.

## Build identity

`dist/build-info.json` carries `sourceSha256`, a hash over `src/`,
`package.json` and `package-lock.json`. The same source yields the same hash
on any machine. `SOURCE_DATE_EPOCH` is recorded when set.
