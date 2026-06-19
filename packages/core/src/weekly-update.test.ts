import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { JsonRunHistoryStore } from "./history-store.js";
import { assembleWeeklyUpdateManifest } from "./manifest.js";
import { JsonMemoryStore } from "./memory-store.js";
import { loadSkill } from "./skill-loader.js";
import { readWeeklyUpdateInput, runWeeklyUpdate } from "./weekly-update.js";

const fixturePath = resolve("fixtures/weekly-update/input.json");

describe("v0.1 weekly update harness", () => {
  it("loads the weekly-update skill", async () => {
    const skill = await loadSkill("skills/weekly-update/SKILL.md");
    expect(skill.id).toBe("skill.weekly_update");
    expect(skill.version).toBe("0.1.0");
    expect(skill.sections["Source policy"]).toContain("Every material claim");
  });

  it("assembles and validates an inspectable context manifest", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    const skill = await loadSkill(input.skillPath);
    const manifest = assembleWeeklyUpdateManifest(input, skill);
    expect(manifest.skill).toEqual({ id: "skill.weekly_update", version: "0.1.0" });
    expect(manifest.sources?.some((source) => source.provider === "workbook")).toBe(true);
    expect(manifest.memory?.[0]?.id).toBe("mem.weekly_style");
  });

  it("runs end-to-end and writes artifact, manifest, audit, and memory export", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "valuclaw-run-"));
    const result = await runWeeklyUpdate({ inputPath: fixturePath, outDir });
    expect(result.artifact.blocked).toBe(false);
    expect(result.artifact.body).toContain("$48.2M");
    expect(result.auditEvents.map((event) => event.type)).toContain("approval");
    expect(await readFile(join(outDir, "artifact.md"), "utf8")).toContain("Weekly Investment Update");
    expect(await readFile(join(outDir, "context-manifest.json"), "utf8")).toContain("skill.weekly_update");
    expect(await readFile(join(outDir, "audit.ndjson"), "utf8")).toContain("\"type\":\"approval\"");
  });

  it("blocks model commentary when workbook context is excluded", async () => {
    const result = await runWeeklyUpdate({ inputPath: fixturePath, excludeWorkbook: true });
    expect(result.artifact.blocked).toBe(true);
    expect(result.artifact.body).toContain("Workbook context is excluded");
    expect(result.manifest.excluded?.[0]?.id).toBe("selected:workbook");
    expect(result.manifest.sources?.some((source) => source.provider === "workbook")).toBe(false);
  });

  it("keeps transparent memory editable and exportable outside skills", async () => {
    const path = join(await mkdtemp(join(tmpdir(), "valuclaw-memory-")), "memory.json");
    const store = new JsonMemoryStore(path);
    await store.upsert({
      id: "mem.test",
      scope: "weekly-update",
      body: "Use concise review language.",
      approved: true,
      updated_at: "2026-06-20T00:00:00Z"
    });
    const exported = await store.export();
    expect(exported).toEqual([
      {
        id: "mem.test",
        scope: "weekly-update",
        body: "Use concise review language.",
        approved: true,
        updated_at: "2026-06-20T00:00:00Z"
      }
    ]);
  });

  it("preserves searchable run history", async () => {
    const dir = await mkdtemp(join(tmpdir(), "valuclaw-history-"));
    const historyPath = join(dir, "history.json");
    await runWeeklyUpdate({ inputPath: fixturePath, historyPath });
    const store = new JsonRunHistoryStore(historyPath);
    const matches = await store.search("weekly-update");
    expect(matches).toHaveLength(1);
    expect(matches[0].artifact.blocked).toBe(false);
    expect((await store.export())[0].manifest.skill.id).toBe("skill.weekly_update");
  });
});
