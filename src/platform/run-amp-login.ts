import { CommandRunner } from "../lib/command-runner";
import { UserError } from "../lib/errors";

export async function runAmpLogin(runner: CommandRunner): Promise<void> {
  const exitCode = await runner.runInteractive("amp", ["login"]);
  if (exitCode !== 0) {
    throw new UserError(`amp login exited with code ${exitCode}`);
  }
}
