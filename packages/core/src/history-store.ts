import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { nowIso, stableId } from "./id.js";
import type { RunHistoryEntry, WeeklyUpdateRunResult } from "./types.js";

export class JsonRunHistoryStore {
  constructor(private readonly path: string) {}

  async appendWeeklyUpdate(result: WeeklyUpdateRunResult): Promise<RunHistoryEntry> {
    const entry: RunHistoryEntry = {
      id: stableId("run", { manifest: result.manifest, artifact: result.artifact }),
      ts: nowIso(),
      workflow: "weekly-update",
      skill: result.manifest.skill,
      artifact: {
        id: result.artifact.id,
        kind: result.artifact.kind,
        title: result.artifact.title,
        blocked: result.artifact.blocked
      },
      manifest: result.manifest,
      audit_event_ids: result.auditEvents.map((event) => event.id)
    };
    const entries = await this.read();
    await this.write([...entries, entry]);
    return entry;
  }

  async search(query: string): Promise<RunHistoryEntry[]> {
    const normalized = query.toLowerCase();
    return (await this.read()).filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(normalized)
    );
  }

  async export(): Promise<RunHistoryEntry[]> {
    return this.read();
  }

  async read(): Promise<RunHistoryEntry[]> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as RunHistoryEntry[];
    } catch {
      return [];
    }
  }

  private async write(entries: RunHistoryEntry[]): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  }
}
