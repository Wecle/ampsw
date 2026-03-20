import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RELEASE_TARGETS, PACKAGE_VERSION, archiveName } from "./release-config";

const projectRoot = new URL("../../", import.meta.url);
const projectRootPath = fileURLToPath(projectRoot);
const releaseDir = join(projectRootPath, "dist", "releases", PACKAGE_VERSION);
const dryRun = process.argv.includes("--dry-run");

function artifactPlan() {
  return RELEASE_TARGETS.map((target) => ({
    target: target.bunTarget,
    archive: archiveName(target),
  }));
}

if (dryRun) {
  console.log(JSON.stringify(artifactPlan(), null, 2));
  process.exit(0);
}

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

for (const target of RELEASE_TARGETS) {
  const workingDir = join(releaseDir, target.id);
  const binaryPath = join(workingDir, "ampsw");
  const archivePath = join(releaseDir, archiveName(target));

  await mkdir(workingDir, { recursive: true });

  const compile = Bun.spawn(
    [
      "bun",
      "build",
      "--compile",
      `--target=${target.bunTarget}`,
      "--outfile",
      binaryPath,
      "src/cli.ts",
    ],
    {
      cwd: projectRootPath,
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  const compileExitCode = await compile.exited;
  if (compileExitCode !== 0) {
    throw new Error(`Failed to compile target ${target.bunTarget}`);
  }

  const tar = Bun.spawn(["tar", "-czf", archivePath, "-C", workingDir, "ampsw"], {
    cwd: projectRootPath,
    stdout: "inherit",
    stderr: "inherit",
  });
  const tarExitCode = await tar.exited;
  if (tarExitCode !== 0) {
    throw new Error(`Failed to archive ${target.id}`);
  }

  await rm(dirname(binaryPath), { recursive: true, force: true });
}
