import { readFile } from "node:fs/promises";
import type { Skill } from "./types.js";

const headingPattern = /^##\s+(.+)$/gm;

export async function loadSkill(path: string): Promise<Skill> {
  const raw = await readFile(path, "utf8");
  const metadata = parseYamlFence(raw);
  const sections = parseSections(raw);
  const id = metadata.id;
  const version = metadata.version;
  if (!id || !version) {
    throw new Error(`Skill ${path} must declare id and version in its yaml fence`);
  }
  return {
    id,
    version,
    owner: metadata.owner,
    status: metadata.status,
    path,
    raw,
    purpose: sections.Purpose ?? "",
    sections
  };
}

function parseYamlFence(raw: string): Record<string, string> {
  const match = raw.match(/```yaml\s+([\s\S]*?)```/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(":");
        if (index === -1) return [line, ""];
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

function parseSections(raw: string): Record<string, string> {
  const headings = [...raw.matchAll(headingPattern)];
  const sections: Record<string, string> = {};
  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    const title = heading[1].trim();
    const start = (heading.index ?? 0) + heading[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index ?? raw.length : raw.length;
    sections[title] = raw.slice(start, end).trim();
  }
  return sections;
}
