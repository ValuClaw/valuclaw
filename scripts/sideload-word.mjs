import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const source = join(projectRoot, "packages", "office-addin", "manifest.xml");
const destination = join(
  homedir(),
  "Library",
  "Containers",
  "com.microsoft.Word",
  "Data",
  "Documents",
  "wef",
  "valuclaw.xml"
);

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
process.stdout.write(`ValuClaw manifest sideloaded for Word: ${destination}\n`);
process.stdout.write("Restart Word, open a document, then choose Home > Add-ins > ValuClaw.\n");
