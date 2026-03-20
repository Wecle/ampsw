import { spawn } from "node:child_process";

export interface RunOptions {
  allowNonZero?: boolean;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  input?: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface InteractiveRunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export interface CommandRunner {
  run(command: string, args: string[], options?: RunOptions): Promise<CommandResult>;
  runInteractive(command: string, args: string[], options?: InteractiveRunOptions): Promise<number>;
  which(command: string): Promise<boolean>;
}

function mergedEnv(extra?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...extra,
  };
}

export function createSystemCommandRunner(): CommandRunner {
  return {
    async run(command, args, options = {}) {
      return await new Promise<CommandResult>((resolve, reject) => {
        const child = spawn(command, args, {
          cwd: options.cwd,
          env: mergedEnv(options.env),
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk) => {
          stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
          stderr += chunk.toString();
        });

        child.on("error", reject);

        child.on("close", (code) => {
          const exitCode = code ?? 1;
          if (exitCode !== 0 && !options.allowNonZero) {
            reject(new Error(stderr.trim() || `${command} exited with code ${exitCode}`));
            return;
          }

          resolve({
            exitCode,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          });
        });

        child.stdin.end(options.input ?? "");
      });
    },

    async runInteractive(command, args, options = {}) {
      return await new Promise<number>((resolve, reject) => {
        const child = spawn(command, args, {
          cwd: options.cwd,
          env: mergedEnv(options.env),
          stdio: "inherit",
        });

        child.on("error", reject);
        child.on("close", (code) => {
          resolve(code ?? 1);
        });
      });
    },

    async which(command) {
      try {
        const result = await this.run("which", [command], { allowNonZero: true });
        return result.exitCode === 0;
      } catch {
        return false;
      }
    },
  };
}
