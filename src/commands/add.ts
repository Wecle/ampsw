import { AppContext } from "../app";
import { addAccount } from "../core/add-account";
import { confirm, promptText } from "../lib/prompt";

export async function runAddCommand(args: string[], context: AppContext): Promise<string> {
  const name = args[0];
  if (!name || args.length !== 1) {
    throw new Error("Usage: ampsw add <name>");
  }

  const result = await addAccount(context, name, {
    promptRenameDefault: async () => {
      const shouldRename = await confirm("The current account is saved as default. Rename it before adding a new account?");
      if (!shouldRename) {
        return null;
      }
      const renameTo = await promptText("Enter a name for the current default account:");
      return renameTo || null;
    },
  });

  if (result.action === "unchanged") {
    return `Amp login did not change accounts. Active account remains ${result.active}.`;
  }
  if (result.action === "reused") {
    return `Logged into an existing saved account. Active account is ${result.active}.`;
  }
  return `Logged into Amp and saved the new account as ${result.active}.`;
}
