import { resolveRuntimePaths } from "../storage/state-paths";

export function resolveAmpSecretsPath(env: NodeJS.ProcessEnv = process.env): string {
  return resolveRuntimePaths(env).ampSecretsPath;
}
