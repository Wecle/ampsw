import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface RuntimePaths {
  ampSecretsPath: string;
  statePath: string;
  vaultPath: string;
}

export function resolveRuntimePaths(env: NodeJS.ProcessEnv = process.env): RuntimePaths {
  const home = env.HOME || homedir();
  const ampSecretsPath = env.AMPSW_AMP_SECRETS_PATH || join(home, ".local", "share", "amp", "secrets.json");

  const statePath =
    env.AMPSW_STATE_PATH ||
    (process.platform === "darwin"
      ? join(home, "Library", "Application Support", "ampsw", "state.json")
      : join(env.XDG_STATE_HOME || join(home, ".local", "state"), "ampsw", "state.json"));

  const vaultPath = env.AMPSW_VAULT_PATH || join(dirname(statePath), "vault.json");

  return {
    ampSecretsPath,
    statePath,
    vaultPath,
  };
}
