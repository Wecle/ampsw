import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { SecretStore } from "./secret-store";

interface VaultFile {
  entries: Record<string, string>;
}

async function readVault(path: string): Promise<VaultFile> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as VaultFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { entries: {} };
    }
    throw error;
  }
}

async function writeVault(path: string, vault: VaultFile): Promise<void> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, `${JSON.stringify(vault, null, 2)}\n`, { mode: 0o600 });
}

export class FileVaultStore implements SecretStore {
  readonly kind = "file-vault" as const;

  constructor(private readonly path: string) {}

  async get(name: string): Promise<string | null> {
    const vault = await readVault(this.path);
    return vault.entries[name] ?? null;
  }

  async set(name: string, secret: string): Promise<void> {
    const vault = await readVault(this.path);
    vault.entries[name] = secret;
    await writeVault(this.path, vault);
  }

  async delete(name: string): Promise<void> {
    const vault = await readVault(this.path);
    delete vault.entries[name];
    await writeVault(this.path, vault);
  }
}
