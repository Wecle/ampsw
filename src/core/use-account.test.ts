import { expect, test } from "bun:test";
import { saveAccount } from "./save-account";
import { useAccount } from "./use-account";
import { createTempDir, createTestContext, writeAmpSecrets } from "../../tests/helpers";

test("useAccount auto-saves the current unknown account before switching", async () => {
  const dir = await createTempDir("use-account");
  await writeAmpSecrets(dir, "first-key");
  const context = await createTestContext(dir, {
    now: () => "2026-03-20T00:00:00.000Z",
  });

  await saveAccount(context, "work");
  await writeAmpSecrets(dir, "second-key");

  const result = await useAccount(context, "work");

  expect(result.currentPreservedAs).toBe("default");
  expect(context.state.active).toBe("work");
});
