import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createAppContext, CreateAppContextOptions } from "../src/app";
import { FileVaultStore } from "../src/storage/file-vault-store";
import { StateStore } from "../src/storage/state-store";

export async function createTempDir(name: string): Promise<string> {
  const path = join(tmpdir(), `${name}-${randomUUID()}`);
  await mkdir(path, { recursive: true });
  return path;
}

export async function writeAmpSecrets(baseDir: string, apiKey: string, extra: Record<string, unknown> = {}): Promise<string> {
  const ampPath = join(baseDir, "amp", "secrets.json");
  await mkdir(join(baseDir, "amp"), { recursive: true });
  await writeFile(
    ampPath,
    `${JSON.stringify(
      {
        ...extra,
        "apiKey@https://ampcode.com/": apiKey,
      },
      null,
      2,
    )}\n`,
  );
  return ampPath;
}

export async function createTestContext(
  baseDir: string,
  options: Omit<CreateAppContextOptions, "env" | "secretStore" | "stateStore"> = {},
) {
  const statePath = join(baseDir, "state", "state.json");
  const vaultPath = join(baseDir, "state", "vault.json");
  const secretStore = new FileVaultStore(vaultPath);
  const stateStore = new StateStore(statePath);

  return await createAppContext({
    ...options,
    env: {
      ...process.env,
      AMPSW_AMP_SECRETS_PATH: join(baseDir, "amp", "secrets.json"),
      AMPSW_STATE_PATH: statePath,
      AMPSW_VAULT_PATH: vaultPath,
    },
    secretStore,
    stateStore,
    platform: "linux",
  });
}
