import { AppContext } from "../app";
import { saveAccount } from "../core/save-account";

export async function runSaveCommand(args: string[], context: AppContext): Promise<string> {
  const name = args[0];
  if (!name || args.length !== 1) {
    throw new Error("Usage: ampsw save <name>");
  }

  const result = await saveAccount(context, name);
  if (result.renamedFrom) {
    return `Renamed ${result.renamedFrom} to ${result.name} and saved the current Amp account.`;
  }
  if (result.alreadySavedAs) {
    return `Current Amp account is already saved as ${result.alreadySavedAs}.`;
  }
  return `Saved current Amp account as ${result.name}.`;
}
