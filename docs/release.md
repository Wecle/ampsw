# Release Notes

## Release assets

The release flow builds Bun-compiled single-file executables for:

- `darwin-arm64`
- `darwin-x64`
- `linux-arm64`
- `linux-x64`

Artifacts are published as `ampsw-<target>.tar.gz`.

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
