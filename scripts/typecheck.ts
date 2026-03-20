const result = await Bun.build({
  entrypoints: ["./src/cli.ts", "./scripts/release/build-binaries.ts"],
  target: "bun",
  outdir: ".tmp/typecheck",
  sourcemap: "none",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

await Bun.$`rm -rf .tmp/typecheck`;
