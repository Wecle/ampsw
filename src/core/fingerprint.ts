import { createHash } from "node:crypto";

export function fingerprintApiKey(apiKey: string): string {
  return `sha256:${createHash("sha256").update(apiKey).digest("hex")}`;
}

export function shortFingerprint(fingerprint: string): string {
  return fingerprint.replace(/^sha256:/, "").slice(0, 8);
}
