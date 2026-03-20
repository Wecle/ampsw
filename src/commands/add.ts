import { AppContext } from "../app";
import { addAccount } from "../core/add-account";

export async function runAddCommand(args: string[], context: AppContext): Promise<string> {
  const name = args[0];
  if (!name || args.length !== 1) {
    throw new Error("Usage: ampsw add <name>");
  }

  const result = await addAccount(context, name);

  if (result.action === "unchanged") {
    return `Amp login did not change accounts. Active account remains ${result.active}.`;
  }
  if (result.action === "reused") {
    return `Logged into an existing saved account. Active account is ${result.active}.`;
  }
  return `Logged into Amp and saved the new account as ${result.active}.`;
}
