import { expect, test } from "bun:test";
import { deleteAccount } from "./delete-account";
import { saveAccount } from "./save-account";
import { createTempDir, createTestContext, writeAmpSecrets } from "../../tests/helpers";

test("deleteAccount removes one saved account", async () => {
  const dir = await createTempDir("delete-account");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  await saveAccount(context, "work");
  await deleteAccount(context, "work");

  expect(context.state.accounts).toHaveLength(0);
  expect(await context.secretStore.get("work")).toBeNull();
});
