import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { MemoryRecord } from "./types.js";

export class JsonMemoryStore {
  constructor(private readonly path: string) {}

  async read(): Promise<MemoryRecord[]> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as MemoryRecord[];
    } catch {
      return [];
    }
  }

  async upsert(record: MemoryRecord): Promise<MemoryRecord[]> {
    const records = await this.read();
    const next = [...records.filter((item) => item.id !== record.id), record];
    await this.write(next);
    return next;
  }

  async export(): Promise<MemoryRecord[]> {
    return this.read();
  }

  async write(records: MemoryRecord[]): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  }
}
