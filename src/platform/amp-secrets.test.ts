import { readFile } from "node:fs/promises";
import { expect, test } from "bun:test";
import { readAmpApiKey, tryReadAmpApiKey, writeAmpApiKey } from "./amp-secrets";
import { createTempDir, writeAmpSecrets } from "../../tests/helpers";

test("readAmpApiKey extracts the current key", async () => {
  const dir = await createTempDir("amp-secrets-read");
  const path = await writeAmpSecrets(dir, "key-123");
  expect(await readAmpApiKey(path)).toBe("key-123");
});

test("writeAmpApiKey preserves unknown fields", async () => {
  const dir = await createTempDir("amp-secrets-write");
  const path = await writeAmpSecrets(dir, "old-key", { theme: "dark" });

  await writeAmpApiKey(path, "new-key");

  const contents = JSON.parse(await readFile(path, "utf8")) as Record<string, string>;
  expect(contents.theme).toBe("dark");
  expect(contents["apiKey@https://ampcode.com/"]).toBe("new-key");
});

test("tryReadAmpApiKey returns null when the file is missing", async () => {
  const dir = await createTempDir("amp-secrets-missing");
  expect(await tryReadAmpApiKey(`${dir}/missing.json`)).toBeNull();
});
