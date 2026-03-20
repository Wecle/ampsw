const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;

if (!tag) {
  throw new Error("Release tag is required");
}

if (!tag.startsWith("v")) {
  throw new Error(`Release tag must start with v, received "${tag}"`);
}

const expectedVersion = tag.slice(1);

const rootPackage = (await Bun.file(new URL("../../package.json", import.meta.url)).json()) as {
  version: string;
};
const npmPackage = (await Bun.file(new URL("../../packaging/npm/package.json", import.meta.url)).json()) as {
  version: string;
};

if (rootPackage.version !== expectedVersion) {
  throw new Error(
    `Root package version ${rootPackage.version} does not match release tag ${expectedVersion}`,
  );
}

if (npmPackage.version !== expectedVersion) {
  throw new Error(
    `npm package version ${npmPackage.version} does not match release tag ${expectedVersion}`,
  );
}

console.log(`Validated release version ${expectedVersion}`);
