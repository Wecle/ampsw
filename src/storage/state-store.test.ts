import { expect, test } from "bun:test";
import { createTempDir } from "../../tests/helpers";
import { StateStore } from "./state-store";
import { createEmptyState } from "./state-types";

test("StateStore loads null when the file does not exist", async () => {
  const dir = await createTempDir("state-store-empty");
  const store = new StateStore(`${dir}/state.json`);
  expect(await store.load()).toBeNull();
});

test("StateStore saves and reloads state", async () => {
  const dir = await createTempDir("state-store-save");
  const store = new StateStore(`${dir}/state.json`);
  const state = createEmptyState("file-vault");
  state.active = "default";

  await store.save(state);

  expect(await store.load()).toEqual(state);
});
