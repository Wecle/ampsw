const packageJson = (await Bun.file(new URL("../../package.json", import.meta.url)).json()) as {
  version: string;
};

export interface ReleaseTarget {
  id: string;
  bunTarget: string;
  os: "darwin" | "linux";
  arch: "arm64" | "x64";
}

export const PACKAGE_VERSION = packageJson.version;
export const RELEASE_REPOSITORY = process.env.AMPSW_RELEASE_REPOSITORY || "Wecle/ampsw";
export const RELEASE_TARGETS: ReleaseTarget[] = [
  { id: "darwin-arm64", bunTarget: "bun-darwin-arm64", os: "darwin", arch: "arm64" },
  { id: "darwin-x64", bunTarget: "bun-darwin-x64", os: "darwin", arch: "x64" },
  { id: "linux-arm64", bunTarget: "bun-linux-arm64", os: "linux", arch: "arm64" },
  { id: "linux-x64", bunTarget: "bun-linux-x64", os: "linux", arch: "x64" },
];

export function releaseTag(version = PACKAGE_VERSION): string {
  return `v${version}`;
}

export function archiveName(target: ReleaseTarget): string {
  return `ampsw-${target.id}.tar.gz`;
}

export function downloadUrl(target: ReleaseTarget, version = PACKAGE_VERSION, repository = RELEASE_REPOSITORY): string {
  return `https://github.com/${repository}/releases/download/${releaseTag(version)}/${archiveName(target)}`;
}

export function latestDownloadUrl(target: ReleaseTarget, repository = RELEASE_REPOSITORY): string {
  return `https://github.com/${repository}/releases/latest/download/${archiveName(target)}`;
}
