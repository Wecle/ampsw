# ampsw

*Switch between saved Amp accounts from the command line*

**English** | [中文](docs/README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/@wecle/ampsw?style=flat-square)](https://www.npmjs.com/package/@wecle/ampsw)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A lightweight CLI tool for managing multiple [Amp](https://ampcode.com) accounts on macOS and Linux. Save, switch, and organize your Amp logins without repeated `amp login` / `amp logout` cycles.

## Features

- **Instant account switching** — jump between saved Amp accounts in one command
- **Auto-import** — detects your current Amp login on first run and saves it as `default`
- **Secure storage** — uses macOS Keychain, Linux Secret Service (via `secret-tool`), or an encrypted local vault as fallback
- **Non-destructive** — never runs `amp logout`; your Amp session is always preserved

## Installation

### curl (recommended)

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

> [!NOTE]
> The npm package name is `@wecle/ampsw`, but the installed CLI command is `ampsw`.

## Usage

```bash
ampsw save <name>                 # Save the current Amp login as <name>
ampsw add <name>                  # Run `amp login`, then save the new account as <name>
ampsw use <name>                  # Switch to a saved account (preserves the current one first)
ampsw status                      # Show saved accounts and which one is active
ampsw rename <old-name> <new-name> # Rename a saved account
ampsw delete <name>               # Delete a saved account
ampsw delete --all                # Delete all saved accounts
```

### Quick start

```bash
# First run auto-imports your current login as "default"
ampsw status

# Save your current login under a friendly name
ampsw save work

# Add a second account (opens `amp login`)
ampsw add personal

# Switch between them
ampsw use work
ampsw use personal
```

### How it works

`ampsw` reads and writes Amp's `~/.local/share/amp/secrets.json`. When you switch accounts, the current API key is automatically preserved so you never lose a session. Account secrets are stored in the OS keychain when available, falling back to a local encrypted vault.

## Development

```bash
bun install
bun test
bun run build
```
