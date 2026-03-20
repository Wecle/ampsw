import { expect, test } from "bun:test";
import { renderFormula } from "../scripts/release/render-homebrew-formula";

test("renderFormula injects version and checksums", async () => {
  const formula = await renderFormula(
    "0.1.0",
    {
      "darwin-arm64": { url: "https://example.com/darwin-arm64.tar.gz", sha256: "aaa" },
      "darwin-x64": { url: "https://example.com/darwin-x64.tar.gz", sha256: "bbb" },
      "linux-arm64": { url: "https://example.com/linux-arm64.tar.gz", sha256: "ccc" },
      "linux-x64": { url: "https://example.com/linux-x64.tar.gz", sha256: "ddd" },
    },
    "Wecle/ampsw",
  );

  expect(formula).toContain('version "0.1.0"');
  expect(formula).toContain('url "https://example.com/darwin-arm64.tar.gz"');
  expect(formula).toContain('sha256 "ddd"');
});
