import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { AppState } from "./state-types";

export class StateStore {
  constructor(public readonly path: string) {}

  async load(): Promise<AppState | null> {
    try {
      const raw = await readFile(this.path, "utf8");
      return JSON.parse(raw) as AppState;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async save(state: AppState): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    await writeFile(this.path, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  }
}
