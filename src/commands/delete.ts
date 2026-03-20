import { AppContext } from "../app";
import { deleteAccount, deleteAllAccounts } from "../core/delete-account";

export async function runDeleteCommand(args: string[], context: AppContext): Promise<string> {
  if (args.length === 1 && args[0] === "--all") {
    await deleteAllAccounts(context);
    return "Deleted all saved accounts.";
  }

  const name = args[0];
  if (!name || args.length !== 1) {
    throw new Error("Usage: ampsw delete <name> | ampsw delete --all");
  }

  await deleteAccount(context, name);
  return `Deleted ${name}.`;
}
