import { StorageBackend } from "./state-types";

export interface SecretStore {
  readonly kind: StorageBackend;
  get(name: string): Promise<string | null>;
  set(name: string, secret: string): Promise<void>;
  delete(name: string): Promise<void>;
}
