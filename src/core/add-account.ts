import { AppContext, persistState, readCurrentApiKey } from "../app";
import { UserError } from "../lib/errors";
import { runAmpLogin } from "../platform/run-amp-login";
import { findAccountByFingerprint, findAccountByName } from "../storage/state-types";
import { createAccountRecord, renameAccount, touchAccount } from "./account-utils";
import { fingerprintApiKey } from "./fingerprint";
import { preserveCurrentAccount } from "./use-account";

export interface AddAccountOptions {
  promptRenameDefault?: () => Promise<string | null>;
  login?: () => Promise<void>;
}

export interface AddAccountResult {
  action: "created" | "reused" | "unchanged";
  active: string;
}

export async function addAccount(
  context: AppContext,
  name: string,
  options: AddAccountOptions = {},
): Promise<AddAccountResult> {
  const requestedName = findAccountByName(context.state, name);
  if (requestedName) {
    throw new UserError(`Account "${name}" already exists`);
  }

  const currentKey = await readCurrentApiKey(context);
  const beforeFingerprint = currentKey ? fingerprintApiKey(currentKey) : null;
  const active = context.state.active ? findAccountByName(context.state, context.state.active) : undefined;

  if (active && active.name === "default" && active.origin === "auto" && active.fingerprint === beforeFingerprint) {
    const renameTo = await options.promptRenameDefault?.();
    if (renameTo) {
      if (renameTo === name) {
        throw new UserError(`Rename the current default account to a different name than "${name}"`);
      }
      if (findAccountByName(context.state, renameTo)) {
        throw new UserError(`Account "${renameTo}" already exists`);
      }
      const defaultSecret = await context.secretStore.get("default");
      if (defaultSecret) {
        await context.secretStore.set(renameTo, defaultSecret);
        await context.secretStore.delete("default");
      }
      renameAccount(context.state, "default", renameTo, context.now());
      await persistState(context);
    }
  }

  await preserveCurrentAccount(context);
  if (options.login) {
    await options.login();
  } else {
    await runAmpLogin(context.runner);
  }

  const newKey = await readCurrentApiKey(context);
  if (!newKey) {
    throw new UserError("Amp login completed without writing an API key.");
  }

  const newFingerprint = fingerprintApiKey(newKey);
  if (beforeFingerprint && beforeFingerprint === newFingerprint) {
    return {
      action: "unchanged",
      active: context.state.active || "default",
    };
  }

  const existing = findAccountByFingerprint(context.state, newFingerprint);
  if (existing) {
    await context.secretStore.set(existing.name, newKey);
    touchAccount(existing, context.now());
    context.state.active = existing.name;
    await persistState(context);
    return {
      action: "reused",
      active: existing.name,
    };
  }

  const now = context.now();
  context.state.accounts.push(createAccountRecord(name, newFingerprint, "user", now));
  context.state.active = name;
  await context.secretStore.set(name, newKey);
  await persistState(context);

  return {
    action: "created",
    active: name,
  };
}
