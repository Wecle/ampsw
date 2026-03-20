import { expect, test } from "bun:test";

test("npm packaging exposes the global ampsw binary", async () => {
  const packageJson = (await Bun.file("./packaging/npm/package.json").json()) as {
    bin: Record<string, string>;
    scripts: Record<string, string>;
  };

  expect(packageJson.bin.ampsw).toBe("./bin/ampsw");
  expect(packageJson.scripts.postinstall).toBe("node ./postinstall.mjs");
});

test("npm package version matches the root package version", async () => {
  const rootPackage = (await Bun.file("./package.json").json()) as { version: string };
  const npmPackage = (await Bun.file("./packaging/npm/package.json").json()) as { version: string };

  expect(npmPackage.version).toBe(rootPackage.version);
});
