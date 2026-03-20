import { expect, test } from "bun:test";
import { renameSavedAccount } from "./rename-account";
import { createTempDir, createTestContext, writeAmpSecrets } from "../../tests/helpers";
import { UserError } from "../lib/errors";
import { createAccountRecord } from "./account-utils";
import { fingerprintApiKey } from "./fingerprint";

test("renameSavedAccount renames default and keeps it active", async () => {
  const dir = await createTempDir("rename-account");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  const result = await renameSavedAccount(context, "default", "work");

  expect(result).toEqual({
    from: "default",
    to: "work",
  });
  expect(context.state.active).toBe("work");
  expect(context.state.accounts).toHaveLength(1);
  expect(context.state.accounts[0]?.name).toBe("work");
  expect(context.state.accounts[0]?.origin).toBe("user");
  expect(await context.secretStore.get("work")).toBe("first-key");
  expect(await context.secretStore.get("default")).toBeNull();
});

test("renameSavedAccount rejects unknown accounts", async () => {
  const dir = await createTempDir("rename-account-unknown");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  await expect(renameSavedAccount(context, "missing", "work")).rejects.toBeInstanceOf(UserError);
});

test("renameSavedAccount rejects duplicate destination names", async () => {
  const dir = await createTempDir("rename-account-duplicate");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  context.state.accounts.push(
    createAccountRecord("personal", fingerprintApiKey("second-key"), "user", "2026-03-20T00:00:00.000Z"),
  );
  await context.secretStore.set("personal", "second-key");

  await expect(renameSavedAccount(context, "default", "personal")).rejects.toBeInstanceOf(UserError);
});

test("renameSavedAccount rejects same-name renames", async () => {
  const dir = await createTempDir("rename-account-same");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  await expect(renameSavedAccount(context, "default", "default")).rejects.toBeInstanceOf(UserError);
});

test("renameSavedAccount rejects missing stored credentials", async () => {
  const dir = await createTempDir("rename-account-missing-secret");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });
  await context.secretStore.delete("default");

  await expect(renameSavedAccount(context, "default", "work")).rejects.toBeInstanceOf(UserError);
  expect(context.state.active).toBe("default");
  expect(context.state.accounts[0]?.name).toBe("default");
  expect(await context.secretStore.get("work")).toBeNull();
});
