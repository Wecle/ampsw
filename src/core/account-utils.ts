import {
  AccountOrigin,
  AccountRecord,
  AppState,
  findAccountByFingerprint,
  findAccountByName,
} from "../storage/state-types";
import { shortFingerprint } from "./fingerprint";

export function createAccountRecord(
  name: string,
  fingerprint: string,
  origin: AccountOrigin,
  now: string,
): AccountRecord {
  return {
    name,
    fingerprint,
    origin,
    createdAt: now,
    updatedAt: now,
  };
}

export function touchAccount(account: AccountRecord, now: string): void {
  account.updatedAt = now;
}

export function renameAccount(state: AppState, from: string, to: string, now: string): AccountRecord {
  const account = findAccountByName(state, from);
  if (!account) {
    throw new Error(`Account ${from} does not exist`);
  }
  account.name = to;
  account.origin = "user";
  account.updatedAt = now;
  if (state.active === from) {
    state.active = to;
  }
  return account;
}

export function ensureAvailableName(state: AppState, name: string): void {
  if (findAccountByName(state, name)) {
    throw new Error(`Account "${name}" already exists`);
  }
}

export function findOrCreateAutoName(state: AppState, fingerprint: string): string {
  const existing = findAccountByFingerprint(state, fingerprint);
  if (existing) {
    return existing.name;
  }

  if (!findAccountByName(state, "default")) {
    return "default";
  }

  return `default-${shortFingerprint(fingerprint)}`;
}
