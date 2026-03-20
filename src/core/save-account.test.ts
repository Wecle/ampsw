import { expect, test } from "bun:test";
import { saveAccount } from "./save-account";
import { createTempDir, createTestContext, writeAmpSecrets } from "../../tests/helpers";

test("saveAccount renames default when the same account is active", async () => {
  const dir = await createTempDir("save-default");
  await writeAmpSecrets(dir, "key-123");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  const result = await saveAccount(context, "work");

  expect(result.renamedFrom).toBe("default");
  expect(context.state.active).toBe("work");
  expect(await context.secretStore.get("work")).toBe("key-123");
  expect(await context.secretStore.get("default")).toBeNull();
});

test("saveAccount treats an existing identical account as already saved", async () => {
  const dir = await createTempDir("save-existing");
  await writeAmpSecrets(dir, "key-123");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  await saveAccount(context, "work");
  const result = await saveAccount(context, "work");

  expect(result.alreadySavedAs).toBe("work");
  expect(context.state.accounts).toHaveLength(1);
});
