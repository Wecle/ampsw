import { CommandRunner } from "../lib/command-runner";
import { SecretStore } from "./secret-store";

const SECRET_LABEL = "ampsw";

export class SecretServiceStore implements SecretStore {
  readonly kind = "linux-secret-service" as const;

  constructor(private readonly runner: CommandRunner) {}

  async get(name: string): Promise<string | null> {
    const result = await this.runner.run(
      "secret-tool",
      ["lookup", "service", SECRET_LABEL, "account", name],
      { allowNonZero: true },
    );

    if (result.exitCode !== 0) {
      return null;
    }

    return result.stdout.trim() || null;
  }

  async set(name: string, secret: string): Promise<void> {
    await this.runner.run(
      "secret-tool",
      ["store", "--label", `ampsw:${name}`, "service", SECRET_LABEL, "account", name],
      { input: secret },
    );
  }

  async delete(name: string): Promise<void> {
    await this.runner.run(
      "secret-tool",
      ["clear", "service", SECRET_LABEL, "account", name],
      { allowNonZero: true },
    );
  }
}
