# Release Notes

## Release assets

The release flow builds Bun-compiled single-file executables for:

- `darwin-arm64`
- `darwin-x64`
- `linux-arm64`
- `linux-x64`

Artifacts are published as `ampsw-<target>.tar.gz`.

## Automated GitHub Release

Pushing a tag like `v0.1.0` triggers the GitHub Actions release workflow. The workflow now:

- runs tests, build, and type checks
- validates that the tag matches both package versions
- builds the four release tarballs
- generates `SHA256SUMS`
- renders `dist/homebrew/ampsw.rb`
- creates a GitHub Release and uploads those files as assets

Before tagging, keep these versions aligned:

- `package.json`
- `packaging/npm/package.json`

## npm

The npm package under `packaging/npm` is a thin installer that downloads the matching
release artifact for the package version.

## Homebrew

The Homebrew formula template lives under `packaging/homebrew`. After release checksums are
generated, render a formula with:

```bash
bun run scripts/release/render-homebrew-formula.ts > ampsw.rb
```

## curl install

The curl installer downloads the matching release artifact from GitHub Releases and installs
the `ampsw` binary to `~/.local/bin` by default.
