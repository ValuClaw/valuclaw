import { createHash } from "node:crypto";

export function stableId(prefix: string, input: unknown): string {
  const hash = createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex")
    .slice(0, 12);
  return `${prefix}.${hash}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
