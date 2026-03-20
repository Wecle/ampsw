import { AppContext, persistState, readCurrentApiKey, writeCurrentApiKey } from "../app";
import { UserError } from "../lib/errors";
import { findAccountByFingerprint, findAccountByName } from "../storage/state-types";
import { createAccountRecord, findOrCreateAutoName, touchAccount } from "./account-utils";
import { fingerprintApiKey } from "./fingerprint";

export interface UseAccountResult {
  currentPreservedAs?: string;
  active: string;
}

export async function preserveCurrentAccount(context: AppContext): Promise<string | undefined> {
  const apiKey = await readCurrentApiKey(context);
  if (!apiKey) {
    return undefined;
  }

  const fingerprint = fingerprintApiKey(apiKey);
  const now = context.now();
  const existing = findAccountByFingerprint(context.state, fingerprint);
  if (existing) {
    touchAccount(existing, now);
    await context.secretStore.set(existing.name, apiKey);
    await persistState(context);
    return existing.name;
  }

  const importName = findOrCreateAutoName(context.state, fingerprint);
  const record = createAccountRecord(importName, fingerprint, "auto", now);
  context.state.accounts.push(record);
  await context.secretStore.set(importName, apiKey);
  await persistState(context);
  return importName;
}

export async function useAccount(context: AppContext, name: string): Promise<UseAccountResult> {
  const target = findAccountByName(context.state, name);
  if (!target) {
    throw new UserError(`Unknown account "${name}"`);
  }

  const currentPreservedAs = await preserveCurrentAccount(context);
  const apiKey = await context.secretStore.get(name);
  if (!apiKey) {
    throw new UserError(`Stored credentials for "${name}" are missing`);
  }

  await writeCurrentApiKey(context, apiKey);
  context.state.active = name;
  touchAccount(target, context.now());
  await persistState(context);

  return {
    currentPreservedAs,
    active: name,
  };
}
