# ampsw

`ampsw` is a Bun + TypeScript CLI for switching between saved Amp accounts on macOS and Linux.

It only supports Amp. The tool reads and writes Amp's `~/.local/share/amp/secrets.json`,
stores saved account secrets securely when possible, and keeps local metadata in its own
state file.

## Install

### curl

```bash
curl -fsSL https://raw.githubusercontent.com/Wecle/ampsw/main/scripts/install.sh | bash
```

### npm

```bash
npm i -g @wecle/ampsw
```

### Homebrew

```bash
brew install Wecle/tap/ampsw
```

## Commands

```bash
ampsw save <name>
ampsw add <name>
ampsw use <name>
ampsw status
ampsw delete <name>
ampsw delete --all
```

## Behavior

- On first run, if Amp is already logged in, `ampsw` auto-imports the current account as `default`.
- `save <name>` stores the current Amp login under a friendly name.
- `add <name>` runs `amp login`, then saves the new login under `<name>`.
- `use <name>` switches to a saved account and preserves the current login first.
- `delete` only removes saved snapshots from `ampsw`; it does not run `amp logout`.
- The npm package name is `@wecle/ampsw`, but the installed CLI command is still `ampsw`.

## Development

```bash
bun install
bun test
bun run build
```
