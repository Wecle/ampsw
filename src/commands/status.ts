import { AppContext } from "../app";

export async function runStatusCommand(_args: string[], context: AppContext): Promise<string> {
  const lines = [
    `Storage backend: ${context.state.storageBackend}`,
    `Active account: ${context.state.active ?? "(none)"}`,
    "Saved accounts:",
  ];

  if (context.state.accounts.length === 0) {
    lines.push("  (none)");
  } else {
    for (const account of context.state.accounts) {
      const markers = [];
      if (account.name === context.state.active) {
        markers.push("active");
      }
      if (account.origin === "auto") {
        markers.push("auto");
      }
      const suffix = markers.length > 0 ? ` [${markers.join(", ")}]` : "";
      lines.push(`  - ${account.name}${suffix}`);
    }
  }

  return lines.join("\n");
}
