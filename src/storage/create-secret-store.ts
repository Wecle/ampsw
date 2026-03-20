import { CommandRunner } from "../lib/command-runner";
import { FileVaultStore } from "./file-vault-store";
import { KeychainStore } from "./keychain-store";
import { SecretStore } from "./secret-store";
import { SecretServiceStore } from "./secret-service-store";

export interface CreateSecretStoreOptions {
  platform?: NodeJS.Platform;
  runner: CommandRunner;
  vaultPath: string;
}

export async function createSecretStore(options: CreateSecretStoreOptions): Promise<SecretStore> {
  const platform = options.platform ?? process.platform;

  if (platform === "darwin") {
    return new KeychainStore(options.runner);
  }

  if (platform === "linux" && (await options.runner.which("secret-tool"))) {
    return new SecretServiceStore(options.runner);
  }

  return new FileVaultStore(options.vaultPath);
}
