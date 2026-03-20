import { CommandRunner } from "../lib/command-runner";
import { SecretStore } from "./secret-store";

const KEYCHAIN_SERVICE = "ampsw";

export class KeychainStore implements SecretStore {
  readonly kind = "macos-keychain" as const;

  constructor(private readonly runner: CommandRunner) {}

  async get(name: string): Promise<string | null> {
    const result = await this.runner.run(
      "security",
      ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-a", name, "-w"],
      { allowNonZero: true },
    );

    if (result.exitCode !== 0) {
      return null;
    }

    return result.stdout.trim();
  }

  async set(name: string, secret: string): Promise<void> {
    await this.runner.run("security", [
      "add-generic-password",
      "-U",
      "-s",
      KEYCHAIN_SERVICE,
      "-a",
      name,
      "-w",
      secret,
    ]);
  }

  async delete(name: string): Promise<void> {
    await this.runner.run(
      "security",
      ["delete-generic-password", "-s", KEYCHAIN_SERVICE, "-a", name],
      { allowNonZero: true },
    );
  }
}
