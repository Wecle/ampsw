import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PACKAGE_VERSION, RELEASE_TARGETS, archiveName, downloadUrl } from "./release-config";

export interface FormulaManifestEntry {
  url: string;
  sha256: string;
}

export type FormulaManifest = Record<string, FormulaManifestEntry>;

export async function renderFormula(version: string, manifest: FormulaManifest, repository: string): Promise<string> {
  const templatePath = join(process.cwd(), "packaging", "homebrew", "ampsw.rb.template");
  const source = await Bun.file(templatePath).text();

  return source
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{HOMEPAGE}}", `https://github.com/${repository}`)
    .replaceAll("{{DARWIN_ARM64_URL}}", manifest["darwin-arm64"]?.url || "")
    .replaceAll("{{DARWIN_ARM64_SHA}}", manifest["darwin-arm64"]?.sha256 || "")
    .replaceAll("{{DARWIN_X64_URL}}", manifest["darwin-x64"]?.url || "")
    .replaceAll("{{DARWIN_X64_SHA}}", manifest["darwin-x64"]?.sha256 || "")
    .replaceAll("{{LINUX_ARM64_URL}}", manifest["linux-arm64"]?.url || "")
    .replaceAll("{{LINUX_ARM64_SHA}}", manifest["linux-arm64"]?.sha256 || "")
    .replaceAll("{{LINUX_X64_URL}}", manifest["linux-x64"]?.url || "")
    .replaceAll("{{LINUX_X64_SHA}}", manifest["linux-x64"]?.sha256 || "");
}

if (import.meta.main) {
  const repository = process.env.AMPSW_RELEASE_REPOSITORY || "Wecle/ampsw";
  const shaFile = join(process.cwd(), "dist", "releases", PACKAGE_VERSION, "SHA256SUMS");
  const shaContents = await readFile(shaFile, "utf8");
  const shaByFile = new Map(
    shaContents
      .trim()
      .split("\n")
      .map((line) => line.split(/\s+/))
      .map(([sha256, file]) => [file, sha256]),
  );

  const manifest: FormulaManifest = {};
  for (const target of RELEASE_TARGETS) {
    const file = archiveName(target);
    manifest[target.id] = {
      url: downloadUrl(target, PACKAGE_VERSION, repository),
      sha256: shaByFile.get(file) || "",
    };
  }

  const formula = await renderFormula(PACKAGE_VERSION, manifest, repository);
  console.log(formula);
}
