import { readFile } from "node:fs/promises";
import JSZip from "jszip";

export async function readZipText(path: string, entry: string): Promise<string> {
  const zip = await JSZip.loadAsync(await readFile(path));
  const file = zip.file(entry);
  if (!file) {
    throw new Error(`Missing zip entry: ${entry}`);
  }
  return file.async("text");
}
