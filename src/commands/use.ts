import { AppContext } from "../app";
import { useAccount } from "../core/use-account";

export async function runUseCommand(args: string[], context: AppContext): Promise<string> {
  const name = args[0];
  if (!name || args.length !== 1) {
    throw new Error("Usage: ampsw use <name>");
  }

  const result = await useAccount(context, name);
  if (result.currentPreservedAs && result.currentPreservedAs !== result.active) {
    return `Switched to ${result.active}. Preserved the previous login as ${result.currentPreservedAs}.`;
  }
  return `Switched to ${result.active}.`;
}
