import { AppContext } from "../app";
import { renameSavedAccount } from "../core/rename-account";

export async function runRenameCommand(args: string[], context: AppContext): Promise<string> {
  const [from, to] = args;
  if (!from || !to || args.length !== 2) {
    throw new Error("Usage: ampsw rename <old-name> <new-name>");
  }

  const result = await renameSavedAccount(context, from, to);
  return `Renamed ${result.from} to ${result.to}.`;
}
