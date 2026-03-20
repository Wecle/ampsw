import { AppContext, persistState } from "../app";
import { UserError } from "../lib/errors";
import { findAccountByName } from "../storage/state-types";

export async function deleteAccount(context: AppContext, name: string): Promise<void> {
  const existing = findAccountByName(context.state, name);
  if (!existing) {
    throw new UserError(`Unknown account "${name}"`);
  }

  context.state.accounts = context.state.accounts.filter((account) => account.name !== name);
  if (context.state.active === name) {
    context.state.active = null;
  }
  await context.secretStore.delete(name);
  await persistState(context);
}

export async function deleteAllAccounts(context: AppContext): Promise<void> {
  for (const account of context.state.accounts) {
    await context.secretStore.delete(account.name);
  }
  context.state.accounts = [];
  context.state.active = null;
  await persistState(context);
}
