#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <formula-path> <version>" >&2
  exit 1
fi

FORMULA_PATH="$1"
VERSION="$2"
TAP_REPO="${AMPSW_HOMEBREW_TAP_REPOSITORY:-Wecle/homebrew-tap}"
FORMULA_NAME="${AMPSW_HOMEBREW_FORMULA_NAME:-ampsw.rb}"

if [ -z "${HOMEBREW_TAP_GITHUB_TOKEN:-}" ]; then
  echo "HOMEBREW_TAP_GITHUB_TOKEN is required" >&2
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

git clone "https://x-access-token:${HOMEBREW_TAP_GITHUB_TOKEN}@github.com/${TAP_REPO}.git" "$TMP_DIR/tap"
mkdir -p "$TMP_DIR/tap/Formula"
cp "$FORMULA_PATH" "$TMP_DIR/tap/Formula/${FORMULA_NAME}"

cd "$TMP_DIR/tap"

git config user.name "${GIT_AUTHOR_NAME:-github-actions[bot]}"
git config user.email "${GIT_AUTHOR_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"

git add "Formula/${FORMULA_NAME}"

if git diff --cached --quiet; then
  echo "No Homebrew tap changes to publish"
  exit 0
fi

git commit -m "chore: update ampsw formula for v${VERSION}"
git push origin HEAD
