import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const wordPath = "/Applications/Microsoft Word.app";
const certificateRoot = process.env.VALUCLAW_CERT_DIR ?? join(homedir(), ".office-addin-dev-certs");
const wordManifestPath = join(
  homedir(),
  "Library",
  "Containers",
  "com.microsoft.Word",
  "Data",
  "Documents",
  "wef",
  "valuclaw.xml"
);
const checks = [
  ["Node 20+", Number(process.versions.node.split(".")[0]) >= 20, process.versions.node],
  ["Microsoft Word", await exists(wordPath), wordPath],
  ["Localhost certificate files", await exists(join(certificateRoot, "localhost.crt")) && await exists(join(certificateRoot, "localhost.key")), certificateRoot],
  ["Word sideload manifest", await exists(wordManifestPath), wordManifestPath],
  ["Local model configured", Boolean(process.env.VALUCLAW_MODEL), process.env.VALUCLAW_MODEL ?? "optional; deterministic demo remains available"]
];

for (const [name, ready, detail] of checks) {
  process.stdout.write(`${ready ? "ready" : "needs setup"}  ${name}: ${detail}\n`);
}

process.stdout.write("\nNext steps:\n");
process.stdout.write("  1. pnpm office:cert       # one-time trusted localhost certificate\n");
process.stdout.write("  2. pnpm office:sideload:word\n");
process.stdout.write("  3. pnpm office:serve\n");
process.stdout.write("  4. Restart Word, open a document, then Home > Add-ins > ValuClaw.\n");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
