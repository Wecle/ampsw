import { chmodSync, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const repository = process.env.AMPSW_INSTALL_REPO || "Wecle/ampsw";
const currentDir = dirname(fileURLToPath(import.meta.url));
const runtimeDir = join(currentDir, "runtime");
const binaryPath = join(runtimeDir, "ampsw");
const packageJson = JSON.parse(await readFile(join(currentDir, "package.json"), "utf8"));
const version = packageJson.version;

function detectTarget() {
  const platform = process.platform;
  const arch = process.arch === "x64" ? "x64" : process.arch === "arm64" ? "arm64" : null;

  if ((platform !== "darwin" && platform !== "linux") || !arch) {
    throw new Error(`Unsupported platform: ${platform}/${process.arch}`);
  }

  return `${platform}-${arch}`;
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      mkdirSync(dirname(destination), { recursive: true });
      const file = createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", reject);
    });
    request.on("error", reject);
  });
}

if (!existsSync(binaryPath)) {
  const target = detectTarget();
  const archive = `ampsw-${target}.tar.gz`;
  const url = `https://github.com/${repository}/releases/download/v${version}/${archive}`;
  const archivePath = join(runtimeDir, archive);

  await download(url, archivePath);
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn("tar", ["-xzf", archivePath, "-C", runtimeDir], {
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (exitCode !== 0) {
    throw new Error(`Failed to extract ${archive}`);
  }
  chmodSync(binaryPath, 0o755);
}
