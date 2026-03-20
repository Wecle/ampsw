import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PACKAGE_VERSION } from "./release-config";

const releaseDir = join(process.cwd(), "dist", "releases", PACKAGE_VERSION);
const files = (await readdir(releaseDir)).filter((file) => file.endsWith(".tar.gz")).sort();
const lines: string[] = [];

for (const file of files) {
  const buffer = await readFile(join(releaseDir, file));
  const digest = createHash("sha256").update(buffer).digest("hex");
  lines.push(`${digest}  ${file}`);
}

await writeFile(join(releaseDir, "SHA256SUMS"), `${lines.join("\n")}\n`);
