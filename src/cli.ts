#!/usr/bin/env bun
import { createAppContext } from "./app";
import { runAddCommand } from "./commands/add";
import { runDeleteCommand } from "./commands/delete";
import { runRenameCommand } from "./commands/rename";
import { runSaveCommand } from "./commands/save";
import { runStatusCommand } from "./commands/status";
import { runUseCommand } from "./commands/use";
import { UserError } from "./lib/errors";

const VERSION = "0.1.0";

type CommandHandler = (args: string[], context: Awaited<ReturnType<typeof createAppContext>>) => Promise<string>;

const commands: Record<string, CommandHandler> = {
  add: runAddCommand,
  save: runSaveCommand,
  rename: runRenameCommand,
  use: runUseCommand,
  status: runStatusCommand,
  delete: runDeleteCommand,
};

function renderHelp(): string {
  return [
    "ampsw",
    "",
    "Usage:",
    "  ampsw <command> [arguments]",
    "",
    "Commands:",
    "  add <name>      Log into Amp and save the account as <name>",
    "  save <name>     Save the current Amp login as <name>",
    "  rename <old-name> <new-name>",
    "                  Rename a saved Amp account",
    "  use <name>      Switch to a saved Amp account",
    "  status          Show saved accounts and the active account",
    "  delete <name>   Delete a saved account",
    "  delete --all    Delete all saved accounts",
    "",
    "Flags:",
    "  --help          Show this help output",
    "  --version       Show the CLI version",
  ].join("\n");
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "help") {
    console.log(renderHelp());
    return 0;
  }

  if (argv[0] === "--version") {
    console.log(VERSION);
    return 0;
  }

  const [commandName, ...args] = argv;
  const handler = commands[commandName];
  if (!handler) {
    throw new UserError(`Unknown command "${commandName}"`);
  }

  const context = await createAppContext();
  const output = await handler(args, context);
  if (output) {
    console.log(output);
  }
  return 0;
}

if (import.meta.main) {
  try {
    const exitCode = await main();
    process.exit(exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
