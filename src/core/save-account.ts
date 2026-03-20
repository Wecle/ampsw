import { AppContext, persistState, readCurrentApiKey } from "../app";
import { UserError } from "../lib/errors";
import { findAccountByFingerprint, findAccountByName } from "../storage/state-types";
import { createAccountRecord, ensureAvailableName, renameAccount, touchAccount } from "./account-utils";
import { fingerprintApiKey } from "./fingerprint";

export interface SaveAccountResult {
  name: string;
  renamedFrom?: string;
  alreadySavedAs?: string;
}

export async function saveAccount(context: AppContext, name: string): Promise<SaveAccountResult> {
  const apiKey = await readCurrentApiKey(context);
  if (!apiKey) {
    throw new UserError("No current Amp login detected. Run `amp login` first.");
  }

  const fingerprint = fingerprintApiKey(apiKey);
  const now = context.now();
  const active = context.state.active ? findAccountByName(context.state, context.state.active) : undefined;

  if (
    active &&
    active.name === "default" &&
    active.origin === "auto" &&
    active.fingerprint === fingerprint &&
    !findAccountByName(context.state, name)
  ) {
    await context.secretStore.set(name, apiKey);
    await context.secretStore.delete("default");
    renameAccount(context.state, "default", name, now);
    await persistState(context);
    return {
      name,
      renamedFrom: "default",
    };
  }

  const fingerprintMatch = findAccountByFingerprint(context.state, fingerprint);
  if (fingerprintMatch) {
    touchAccount(fingerprintMatch, now);
    context.state.active = fingerprintMatch.name;
    await context.secretStore.set(fingerprintMatch.name, apiKey);
    await persistState(context);
    return {
      name: fingerprintMatch.name,
      alreadySavedAs: fingerprintMatch.name,
    };
  }

  ensureAvailableName(context.state, name);
  context.state.accounts.push(createAccountRecord(name, fingerprint, "user", now));
  context.state.active = name;
  await context.secretStore.set(name, apiKey);
  await persistState(context);

  return { name };
}
