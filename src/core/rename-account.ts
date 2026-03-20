import { AppContext, persistState } from "../app";
import { UserError } from "../lib/errors";
import { findAccountByName } from "../storage/state-types";
import { renameAccount } from "./account-utils";

export interface RenameSavedAccountResult {
  from: string;
  to: string;
}

export async function renameSavedAccount(
  context: AppContext,
  from: string,
  to: string,
): Promise<RenameSavedAccountResult> {
  const existing = findAccountByName(context.state, from);
  if (!existing) {
    throw new UserError(`Unknown account "${from}"`);
  }

  if (from === to) {
    throw new UserError(`Rename the account to a different name than "${to}"`);
  }

  if (findAccountByName(context.state, to)) {
    throw new UserError(`Account "${to}" already exists`);
  }

  const secret = await context.secretStore.get(from);
  if (!secret) {
    throw new UserError(`Stored credentials for "${from}" are missing`);
  }

  await context.secretStore.set(to, secret);
  await context.secretStore.delete(from);
  renameAccount(context.state, from, to, context.now());
  await persistState(context);

  return { from, to };
}
