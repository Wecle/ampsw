import { expect, test } from "bun:test";
import { RELEASE_TARGETS, archiveName, releaseTag } from "../scripts/release/release-config";

test("release config exposes the expected target matrix", () => {
  expect(RELEASE_TARGETS.map((target) => target.id)).toEqual([
    "darwin-arm64",
    "darwin-x64",
    "linux-arm64",
    "linux-x64",
  ]);
  expect(releaseTag("0.1.0")).toBe("v0.1.0");
  expect(archiveName(RELEASE_TARGETS[0]!)).toBe("ampsw-darwin-arm64.tar.gz");
});
