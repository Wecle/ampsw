# ampsw Rename Command Design

## Summary

This change removes the rename prompt from `ampsw add <name>` and adds an explicit
`ampsw rename <old-name> <new-name>` command for users who want to rename saved
accounts, including the auto-imported `default` account.

## Problem

Today `ampsw add <name>` mixes two concerns:

- preserving the current login before `amp login`
- optionally renaming the auto-imported `default` account

That prompt is noisy when the user only wants to log into another account and keep
going. Renaming should be an explicit management action instead of part of the add
flow.

## Goals

- Make `ampsw add <name>` stop prompting to rename `default`
- Add `ampsw rename <old-name> <new-name>` as the explicit rename workflow
- Allow renaming `default` just like any other saved account
- Keep state metadata and secret storage consistent during rename

## Non-Goals

- Changing the `save <name>` behavior that can rename `default` when saving the
  current login under a friendly name
- Adding aliases, partial matching, or batch rename operations
- Changing how first-run auto-import chooses `default`

## CLI Changes

### `ampsw add <name>`

- Validate the requested name as before
- Preserve the current login using the existing preservation flow
- Run `amp login`
- Save or reuse the post-login account under the requested name
- Do not prompt to rename `default`

### `ampsw rename <old-name> <new-name>`

- Validate exactly two arguments
- Require that `<old-name>` exists
- Require that `<new-name>` does not already exist
- Reject renaming an account to the same name
- Move the saved secret from `<old-name>` to `<new-name>`
- Rename the account record in state and update `active` if needed

## Implementation Notes

- Keep the rename logic in a dedicated core module instead of embedding it in the
  CLI handler.
- Reuse the existing `renameAccount(...)` state helper to update metadata.
- Treat missing stored credentials as an error so state and secret storage cannot
  drift apart during rename.

## Error Handling

- `add <name>` still rejects duplicate requested names
- `rename <old-name> <new-name>` returns user-facing errors for unknown accounts,
  duplicate target names, and same-name renames
- If the source secret is missing, abort without mutating state

## Testing

- Update add-account tests to cover the non-prompting behavior with an auto-imported
  `default` account
- Add rename-account tests for:
  - successful rename, including renaming `default`
  - unknown source name
  - duplicate destination name
  - same source and destination name
  - missing stored secret
- Update CLI help tests and README command list
