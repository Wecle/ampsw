import { expect, test } from "bun:test";
import { main } from "../src/cli";

test("cli help lists the supported commands", async () => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (message?: unknown) => {
    logs.push(String(message ?? ""));
  };

  try {
    const exitCode = await main(["--help"]);
    expect(exitCode).toBe(0);
  } finally {
    console.log = originalLog;
  }

  const output = logs.join("\n");
  expect(output).toContain("add <name>");
  expect(output).toContain("save <name>");
  expect(output).toContain("use <name>");
  expect(output).toContain("status");
  expect(output).toContain("delete <name>");
});
