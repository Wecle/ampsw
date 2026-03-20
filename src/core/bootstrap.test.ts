import { expect, test } from "bun:test";
import { bootstrapState } from "./bootstrap";
import { FileVaultStore } from "../storage/file-vault-store";
import { StateStore } from "../storage/state-store";
import { createTempDir } from "../../tests/helpers";

test("bootstrapState imports the current account as default", async () => {
  const dir = await createTempDir("bootstrap-default");
  const stateStore = new StateStore(`${dir}/state.json`);
  const secretStore = new FileVaultStore(`${dir}/vault.json`);

  const state = await bootstrapState({
    stateStore,
    secretStore,
    readCurrentApiKey: async () => "key-123",
    now: () => "2026-03-20T00:00:00.000Z",
  });

  expect(state.active).toBe("default");
  expect(state.accounts).toHaveLength(1);
  expect(state.accounts[0]?.origin).toBe("auto");
  expect(await secretStore.get("default")).toBe("key-123");
});

test("bootstrapState creates empty state when there is no login", async () => {
  const dir = await createTempDir("bootstrap-empty");
  const stateStore = new StateStore(`${dir}/state.json`);
  const secretStore = new FileVaultStore(`${dir}/vault.json`);

  const state = await bootstrapState({
    stateStore,
    secretStore,
    readCurrentApiKey: async () => null,
    now: () => "2026-03-20T00:00:00.000Z",
  });

  expect(state.active).toBeNull();
  expect(state.accounts).toHaveLength(0);
});
