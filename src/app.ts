import { createSystemCommandRunner, CommandRunner } from "./lib/command-runner";
import { tryReadAmpApiKey, writeAmpApiKey } from "./platform/amp-secrets";
import { bootstrapState } from "./core/bootstrap";
import { createSecretStore } from "./storage/create-secret-store";
import { SecretStore } from "./storage/secret-store";
import { resolveRuntimePaths, RuntimePaths } from "./storage/state-paths";
import { StateStore } from "./storage/state-store";
import { AppState } from "./storage/state-types";

export interface AppContext {
  paths: RuntimePaths;
  runner: CommandRunner;
  secretStore: SecretStore;
  stateStore: StateStore;
  state: AppState;
  now: () => string;
}

export interface CreateAppContextOptions {
  env?: NodeJS.ProcessEnv;
  now?: () => string;
  platform?: NodeJS.Platform;
  runner?: CommandRunner;
  secretStore?: SecretStore;
  stateStore?: StateStore;
}

export async function createAppContext(options: CreateAppContextOptions = {}): Promise<AppContext> {
  const paths = resolveRuntimePaths(options.env);
  const runner = options.runner ?? createSystemCommandRunner();
  const stateStore = options.stateStore ?? new StateStore(paths.statePath);
  const secretStore =
    options.secretStore ??
    (await createSecretStore({
      platform: options.platform,
      runner,
      vaultPath: paths.vaultPath,
    }));
  const now = options.now ?? (() => new Date().toISOString());

  const state = await bootstrapState({
    stateStore,
    secretStore,
    readCurrentApiKey: async () => await tryReadAmpApiKey(paths.ampSecretsPath),
    now,
  });

  return {
    paths,
    runner,
    secretStore,
    stateStore,
    state,
    now,
  };
}

export async function persistState(context: AppContext): Promise<void> {
  await context.stateStore.save(context.state);
}

export async function readCurrentApiKey(context: AppContext): Promise<string | null> {
  return await tryReadAmpApiKey(context.paths.ampSecretsPath);
}

export async function writeCurrentApiKey(context: AppContext, apiKey: string): Promise<void> {
  await writeAmpApiKey(context.paths.ampSecretsPath, apiKey);
}
