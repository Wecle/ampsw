import { expect, test } from "bun:test";
import { addAccount } from "./add-account";
import { createTempDir, createTestContext, writeAmpSecrets } from "../../tests/helpers";

test("addAccount saves a newly logged-in account under the requested name without renaming default", async () => {
  const dir = await createTempDir("add-account");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  const result = await addAccount(context, "personal", {
    login: async () => {
      await writeAmpSecrets(dir, "second-key");
    },
  });

  expect(result.action).toBe("created");
  expect(context.state.active).toBe("personal");
  expect(context.state.accounts.map((account) => account.name)).toEqual(["default", "personal"]);
  expect(await context.secretStore.get("default")).toBe("first-key");
  expect(await context.secretStore.get("personal")).toBe("second-key");
});
