# Rename Command Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `default` rename prompt from `ampsw add` and add an explicit `ampsw rename <old-name> <new-name>` command.

**Architecture:** Keep `add` focused on preserving the current account and logging into a new one. Introduce a dedicated rename core module that moves the stored secret first, then updates local state with the existing rename helper.

**Tech Stack:** Bun, TypeScript, Bun test

---

## Chunk 1: Add Rename Command Core

### Task 1: Add failing rename-account tests

**Files:**
- Create: `src/core/rename-account.test.ts`
- Test: `src/core/rename-account.test.ts`

- [ ] **Step 1: Write a failing success-path test**

```ts
test("renameAccountSnapshot renames default and keeps it active", async () => {
  // bootstrap context with current key auto-imported as default
  // call renameAccountSnapshot(context, "default", "work")
  // expect state.active to be "work"
  // expect vault entry to move from default to work
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `bun test src/core/rename-account.test.ts`
Expected: FAIL because the module does not exist yet.

- [ ] **Step 3: Add validation tests**

```ts
test("renameAccountSnapshot rejects unknown accounts", async () => {});
test("renameAccountSnapshot rejects duplicate destination names", async () => {});
test("renameAccountSnapshot rejects same-name renames", async () => {});
test("renameAccountSnapshot rejects missing stored credentials", async () => {});
```

- [ ] **Step 4: Run the focused test file again**

Run: `bun test src/core/rename-account.test.ts`
Expected: FAIL with missing implementation assertions.

### Task 2: Implement the rename core flow

**Files:**
- Create: `src/core/rename-account.ts`
- Modify: `src/core/account-utils.ts`
- Test: `src/core/rename-account.test.ts`

- [ ] **Step 1: Implement `renameAccountSnapshot(context, from, to)`**

```ts
export async function renameAccountSnapshot(context: AppContext, from: string, to: string): Promise<void> {
  // validate source and destination names
  // load secret from old name
  // write secret to new name
  // delete old secret
  // rename state record
  // persist state
}
```

- [ ] **Step 2: Keep validation user-facing**

Use `UserError` for unknown accounts, same-name renames, duplicate destination names,
and missing saved credentials.

- [ ] **Step 3: Run the focused rename tests**

Run: `bun test src/core/rename-account.test.ts`
Expected: PASS

## Chunk 2: Wire CLI and Simplify Add Flow

### Task 3: Remove rename prompt from add flow

**Files:**
- Modify: `src/core/add-account.ts`
- Modify: `src/commands/add.ts`
- Modify: `src/core/add-account.test.ts`

- [ ] **Step 1: Remove prompt-related option and branching from add**

```ts
export interface AddAccountOptions {
  login?: () => Promise<void>;
}
```

- [ ] **Step 2: Update the add command to call the simplified core API**

Remove prompt imports and keep the command output unchanged.

- [ ] **Step 3: Update tests around auto-imported default behavior**

Add an assertion that `default` remains stored while the new account is created.

- [ ] **Step 4: Run focused add tests**

Run: `bun test src/core/add-account.test.ts`
Expected: PASS

### Task 4: Add the `rename` command

**Files:**
- Create: `src/commands/rename.ts`
- Modify: `src/cli.ts`
- Modify: `tests/cli.test.ts`

- [ ] **Step 1: Add a CLI handler with strict argument validation**

```ts
if (args.length !== 2) {
  throw new Error("Usage: ampsw rename <old-name> <new-name>");
}
```

- [ ] **Step 2: Register the command and help text**

Ensure `renderHelp()` lists `rename <old-name> <new-name>`.

- [ ] **Step 3: Update CLI tests**

Assert the help output contains `rename <old-name> <new-name>`.

- [ ] **Step 4: Run focused CLI tests**

Run: `bun test tests/cli.test.ts`
Expected: PASS

## Chunk 3: Update Docs and Verify

### Task 5: Update user-facing docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the rename command to the command list**

- [ ] **Step 2: Update behavior notes**

Document that `add` no longer prompts to rename `default` and that renaming is done
with `rename`.

- [ ] **Step 3: Review for terminology consistency**

Keep wording aligned with the CLI help and command outputs.

### Task 6: Run verification

**Files:**
- Test: `src/core/add-account.test.ts`
- Test: `src/core/rename-account.test.ts`
- Test: `tests/cli.test.ts`
- Test: repository test suite

- [ ] **Step 1: Run targeted tests**

Run: `bun test src/core/add-account.test.ts src/core/rename-account.test.ts tests/cli.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `bun test`
Expected: PASS

- [ ] **Step 3: Run type checks**

Run: `bun run lint:types`
Expected: PASS
