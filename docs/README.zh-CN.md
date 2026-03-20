# ampsw

*从命令行快速切换 Amp 账号*

[![npm version](https://img.shields.io/npm/v/@wecle/ampsw?style=flat-square)](https://www.npmjs.com/package/@wecle/ampsw)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[English](../README.md) | **中文**

一个轻量级 CLI 工具，用于在 macOS 和 Linux 上管理多个 [Amp](https://ampcode.com) 账号。保存、切换和管理你的 Amp 登录信息，无需反复执行 `amp login` / `amp logout`。

## 特性

- **即时切换账号** — 一条命令在已保存的 Amp 账号间切换
- **自动导入** — 首次运行时自动检测当前 Amp 登录并保存为 `default`
- **安全存储** — 使用 macOS 钥匙串、Linux Secret Service（通过 `secret-tool`），或本地加密文件作为后备
- **非破坏性** — 不会执行 `amp logout`，你的 Amp 会话始终被保留

## 安装

### curl（推荐）

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
> npm 包名为 `@wecle/ampsw`，但安装后的命令仍为 `ampsw`。

## 使用方法

```bash
ampsw save <name>                 # 将当前 Amp 登录保存为 <name>
ampsw add <name>                  # 执行 `amp login`，然后将新账号保存为 <name>
ampsw use <name>                  # 切换到已保存的账号（会自动保留当前账号）
ampsw status                      # 显示已保存的账号及当前活跃账号
ampsw rename <old-name> <new-name> # 重命名已保存的账号
ampsw delete <name>               # 删除已保存的账号
ampsw delete --all                # 删除所有已保存的账号
```

### 快速上手

```bash
# 首次运行会自动导入当前登录为 "default"
ampsw status

# 为当前登录起一个名字
ampsw save work

# 添加第二个账号（会打开 `amp login`）
ampsw add personal

# 在账号间切换
ampsw use work
ampsw use personal
```

### 工作原理

`ampsw` 读写 Amp 的 `~/.local/share/amp/secrets.json`。切换账号时，当前 API Key 会被自动保留，因此你不会丢失任何会话。账号密钥优先存储在系统钥匙串中，不可用时回退到本地加密文件。

## 开发

```bash
bun install
bun test
bun run build
```
