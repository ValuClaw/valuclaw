import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

await mkdir(dist, { recursive: true });
for (const asset of ["taskpane.html", "icon-16.png", "icon-32.png", "icon-64.png", "icon-80.png"]) {
  await copyFile(join(root, "public", asset), join(dist, asset));
}
