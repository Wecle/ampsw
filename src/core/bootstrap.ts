import { SecretStore } from "../storage/secret-store";
import { StateStore } from "../storage/state-store";
import { createEmptyState, AppState, findAccountByFingerprint } from "../storage/state-types";
import { createAccountRecord } from "./account-utils";
import { fingerprintApiKey } from "./fingerprint";

export interface BootstrapOptions {
  stateStore: StateStore;
  secretStore: SecretStore;
  readCurrentApiKey: () => Promise<string | null>;
  now: () => string;
}

export async function bootstrapState(options: BootstrapOptions): Promise<AppState> {
  const existing = await options.stateStore.load();
  if (existing) {
    return existing;
  }

  const state = createEmptyState(options.secretStore.kind);
  const currentKey = await options.readCurrentApiKey();

  if (currentKey) {
    const fingerprint = fingerprintApiKey(currentKey);
    if (!findAccountByFingerprint(state, fingerprint)) {
      const now = options.now();
      state.accounts.push(createAccountRecord("default", fingerprint, "auto", now));
      state.active = "default";
      await options.secretStore.set("default", currentKey);
    }
  }

  await options.stateStore.save(state);
  return state;
}
