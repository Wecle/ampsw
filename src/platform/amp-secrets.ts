import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { UserError } from "../lib/errors";

export const AMP_API_KEY_FIELD = "apiKey@https://ampcode.com/";

export type AmpSecrets = Record<string, unknown>;

export async function readAmpSecrets(secretsPath: string): Promise<AmpSecrets> {
  const raw = await readFile(secretsPath, "utf8");
  return JSON.parse(raw) as AmpSecrets;
}

export async function readAmpApiKey(secretsPath: string): Promise<string> {
  const secrets = await readAmpSecrets(secretsPath);
  const value = secrets[AMP_API_KEY_FIELD];
  if (typeof value !== "string" || value.trim() === "") {
    throw new UserError(`Amp secrets file does not contain ${AMP_API_KEY_FIELD}`);
  }
  return value;
}

export async function tryReadAmpApiKey(secretsPath: string): Promise<string | null> {
  try {
    return await readAmpApiKey(secretsPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || error instanceof UserError) {
      return null;
    }
    throw error;
  }
}

export async function writeAmpApiKey(secretsPath: string, apiKey: string): Promise<void> {
  let secrets: AmpSecrets = {};
  try {
    secrets = await readAmpSecrets(secretsPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  secrets[AMP_API_KEY_FIELD] = apiKey;
  await mkdir(dirname(secretsPath), { recursive: true, mode: 0o700 });
  await writeFile(secretsPath, `${JSON.stringify(secrets, null, 2)}\n`, { mode: 0o600 });
}
