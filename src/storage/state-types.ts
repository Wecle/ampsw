export type StorageBackend = "macos-keychain" | "linux-secret-service" | "file-vault";
export type AccountOrigin = "auto" | "user";

export interface AccountRecord {
  name: string;
  fingerprint: string;
  origin: AccountOrigin;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  version: 1;
  active: string | null;
  storageBackend: StorageBackend;
  accounts: AccountRecord[];
}

export function createEmptyState(storageBackend: StorageBackend): AppState {
  return {
    version: 1,
    active: null,
    storageBackend,
    accounts: [],
  };
}

export function findAccountByName(state: AppState, name: string): AccountRecord | undefined {
  return state.accounts.find((account) => account.name === name);
}

export function findAccountByFingerprint(state: AppState, fingerprint: string): AccountRecord | undefined {
  return state.accounts.find((account) => account.fingerprint === fingerprint);
}
