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

The workflow expects these credentials if you want full automation:

- `NPM_TOKEN`
  Required for `npm publish`
- `HOMEBREW_TAP_GITHUB_TOKEN`
  Required to push formula updates into the tap repo
- Repository variable `HOMEBREW_TAP_REPOSITORY`
  Optional. Defaults to `Wecle/homebrew-tap` if unset

## npm

The npm package under `packaging/npm` is a thin installer that downloads the matching
release artifact for the package version.

When `NPM_TOKEN` is configured, the release workflow runs `npm publish --access public`
from `packaging/npm` after the GitHub Release has been created.

The published npm package name is `@wecle/ampsw`, while the CLI command remains `ampsw`.

## Homebrew

The Homebrew formula template lives under `packaging/homebrew`. After release checksums are
generated, render a formula with:

```bash
bun run scripts/release/render-homebrew-formula.ts > ampsw.rb
```

When `HOMEBREW_TAP_GITHUB_TOKEN` is configured, the release workflow also clones the tap
repository, writes `Formula/ampsw.rb`, commits, and pushes the update automatically.

## curl install

The curl installer downloads the matching release artifact from GitHub Releases and installs
the `ampsw` binary to `~/.local/bin` by default.
