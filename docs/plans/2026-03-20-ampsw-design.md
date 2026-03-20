# ampsw Design

## Summary

`ampsw` is a Bun + TypeScript CLI for switching Amp accounts on macOS and Linux.
It only supports Amp. It manages named account snapshots, stores API keys outside the
repo, and distributes through three installation paths:

- `curl -fsSL ... | bash`
- `npm i -g ampsw`
- `brew install <tap>/ampsw`

## Goals

- Support saving and switching multiple Amp accounts locally.
- Keep the CLI surface focused on Amp only.
- Provide a good first-run experience for users who already have Amp installed.
- Ship a single product name and command: `ampsw`.
- Support macOS and Linux in the first release.

## Non-Goals

- Claude Code support.
- Windows support.
- Managing Amp history, threads, cache, or other local state beyond `secrets.json`.
- Replacing Amp's own login flow.

## User Model

Users authenticate with Amp using the official CLI. `ampsw` reads the current Amp API key
from `~/.local/share/amp/secrets.json`, stores named snapshots, and writes one snapshot
back when the user switches accounts.

If a user installs `ampsw` after already logging into Amp, the CLI should auto-import the
current account as `default` the first time it initializes local state. The user does not
need to manually run `save` first.

## Commands

### `ampsw save <name>`

Save the currently logged-in Amp account as `<name>`.

- Reads the current API key from Amp's `secrets.json`.
- If the current active account is `default` and has the same key fingerprint, rename
  `default` to `<name>` instead of duplicating it.
- Reject duplicate names unless an explicit overwrite flag is introduced later.

### `ampsw add <name>`

Log into a new Amp account, save it as `<name>`, and make it active.

Behavior:

1. Inspect the current Amp login state.
2. If the current account maps to an existing saved account, refresh its stored snapshot.
3. If the current account is only known as `default`, prompt the user whether they want
   to rename `default` before proceeding.
4. Run `amp login` interactively.
5. Re-read Amp's current API key.
6. If the post-login key is unchanged, do not create a new entry.
7. If the new key already matches an existing saved account, mark that account active.
8. Otherwise save it under `<name>` and mark it active.

### `ampsw use <name>`

Switch to a previously saved account.

Behavior:

1. Read the current Amp login state.
2. Before switching, ensure the current account is preserved:
   - If it matches an existing saved account, refresh its snapshot.
   - If it does not exist in local state, auto-import it as `default`.
   - If `default` is already taken by another fingerprint, fall back to
     `default-<short-fingerprint>`.
3. Load the requested account from secure storage.
4. Update only the `apiKey@https://ampcode.com/` field in Amp's `secrets.json`.
5. Mark the selected account active in local state.

### `ampsw status`

Show all saved accounts, the active account, and the storage backend currently in use.

### `ampsw delete <name>` / `ampsw delete --all`

Delete one saved account or all saved accounts. This does not call `amp logout`.

## Amp Integration

`ampsw` only reads and writes `~/.local/share/amp/secrets.json`.

Confirmed current shape on the local machine:

```json
{
  "apiKey@https://ampcode.com/": "..."
}
```

Write behavior should preserve unknown future fields:

1. Parse the existing JSON object if present.
2. Replace only `apiKey@https://ampcode.com/`.
3. Write the updated object back with `0600` permissions.

## Local State

Local metadata and secret material are stored separately.

### State file

Suggested path:

- macOS: `~/Library/Application Support/ampsw/state.json`
- Linux: `${XDG_STATE_HOME:-~/.local/state}/ampsw/state.json`

Structure:

```json
{
  "version": 1,
  "active": "work",
  "storageBackend": "keychain",
  "accounts": [
    {
      "name": "work",
      "fingerprint": "sha256:...",
      "origin": "user",
      "createdAt": "2026-03-20T15:10:00Z",
      "updatedAt": "2026-03-20T15:10:00Z"
    }
  ]
}
```

Notes:

- `fingerprint` is the SHA-256 hash of the API key. It exists only to deduplicate and
  identify the current account without storing secrets in metadata.
- `origin` distinguishes auto-imported accounts like `default` from user-named accounts.

### Secret storage

Use an abstract `SecretStore` with platform-specific backends:

- macOS: Keychain via the `security` command.
- Linux: Secret Service via `secret-tool` when available.
- Linux fallback: local `vault.json` with `0600` permissions.

The CLI should prefer OS-native storage, but must remain usable on Linux machines without
`secret-tool`.

## First-Run Behavior

On startup, if `state.json` does not exist:

1. Create the state directory.
2. Check whether Amp `secrets.json` exists and contains an API key.
3. If yes, import that account automatically as `default`.
4. Mark `default` active.
5. Persist the current storage backend in state.

This avoids requiring users to run `save` immediately after installation.

## Packaging And Distribution

### Bun build strategy

Source is written in TypeScript and compiled into single-file executables using
`bun build --compile`.

Primary targets:

- `bun-darwin-arm64`
- `bun-darwin-x64-baseline`
- `bun-linux-arm64`
- `bun-linux-x64-baseline`

Linux packaging should account for `glibc` and `musl` distribution where needed,
especially for npm global installs.

### `curl | bash`

The install script should:

1. Detect OS and architecture.
2. Resolve the matching GitHub Release asset.
3. Download the tarball or binary plus checksums.
4. Install `ampsw` into `~/.local/bin` by default, with an optional custom prefix.
5. Print PATH guidance when necessary.

### `npm i -g ampsw`

Publish a thin npm wrapper package named `ampsw` plus platform packages containing the
prebuilt executable.

The npm package should:

- expose `ampsw` as the global bin name
- use platform-specific packages selected by `os`, `cpu`, and `libc`
- avoid requiring Node.js at runtime after installation if the binary is present

### Homebrew

Ship a custom tap first rather than targeting `homebrew/core`.

The formula should download the GitHub Release artifact for the matching version and
install the `ampsw` executable into Homebrew's prefix.

## Testing Strategy

### Unit tests

- State file parsing and migrations
- Fingerprint and deduplication logic
- Auto-import logic for `default`
- Secret store adapters with command execution mocked
- Amp `secrets.json` read/merge/write behavior

### Integration tests

- Fresh install with existing Amp login auto-imports `default`
- `save` renames `default` to a named account
- `add` saves a newly logged-in account
- `use` preserves the current unsaved account before switching
- `delete --all` clears state and stored secrets

### Manual verification

- macOS with Keychain available
- Linux with `secret-tool`
- Linux without `secret-tool` to verify fallback storage
- Install via curl, npm, and brew

## Repository Structure

Planned layout:

- `src/cli.ts`
- `src/commands/*.ts`
- `src/core/*.ts`
- `src/platform/*.ts`
- `src/storage/*.ts`
- `src/lib/*.ts`
- `scripts/install.sh`
- `scripts/release/*.ts`
- `packaging/npm/*`
- `packaging/homebrew/*`

## Risks

- Bun target packaging may differ across runtime versions, so release automation must pin
  the Bun version.
- Linux secret storage availability is inconsistent; fallback storage must be explicit and
  clearly warned about.
- `amp login` is interactive, so `add` must preserve TTY behavior and pass through stdout
  and stderr cleanly.

## Decision Log

- The command name is `ampsw`.
- `switch` is renamed to `use`.
- `save` means “persist the current account snapshot”.
- `add` means “log in to a new account, save it, and activate it”.
- New installations auto-import the current Amp account as `default`.
- Only Amp is supported.
- Supported platforms are macOS and Linux.
