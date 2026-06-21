import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { weeklyUpdateDemoPayload } from "./demo-payload.js";
import { readWeeklyUpdateInput, runWeeklyUpdate } from "./weekly-update.js";

const fixturePath = resolve("fixtures/weekly-update/input.json");

describe("weekly update demo payload", () => {
  it("generates a synthetic customer-demo packet from the weekly-update run", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    const result = await runWeeklyUpdate({ inputPath: fixturePath });
    const payload = weeklyUpdateDemoPayload({
      input,
      result,
      fixtureId: "fixtures/weekly-update/input.json",
      openCoreCommit: "test"
    });
    expect(payload.synthetic_only).toBe(true);
    expect(payload.workflow.title).toBe("Weekly investment update");
    expect(payload.permission_preview.will_not_touch.map((item) => item.id)).toContain("no-all-mail");
    expect(payload.policy_checks.find((item) => item.id === "memory-policy")?.status).toBe("pass");
    expect(payload.artifact_preview.sections[0].source_ids.length).toBeGreaterThan(0);
    expect(payload.artifact_preview.sections.find((section) => section.id === "assumption-review")?.source_ids).toEqual(["wb:Model_v12.xlsx#Assumptions!C19"]);
  });

  it("keeps rejected memory visible but out of model context", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    const result = await runWeeklyUpdate({ inputPath: fixturePath });
    const payload = weeklyUpdateDemoPayload({ input, result, fixtureId: "fixture" });
    expect(payload.context_preview.approved_memory.map((memory) => memory.id)).toEqual(["mem.weekly_style"]);
    expect(payload.context_preview.rejected_memory.map((memory) => memory.id)).toEqual(["mem.candidate.promotional_tone"]);
    expect(JSON.stringify(payload.context_preview.approved_memory)).not.toContain("promotional tone");
  });

  it("blocks numerical commentary when workbook context is excluded", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    input.includeWorkbook = false;
    const result = await runWeeklyUpdate({ inputPath: fixturePath, excludeWorkbook: true });
    const payload = weeklyUpdateDemoPayload({ input, result, fixtureId: "fixture" });
    expect(payload.artifact_preview.blocked).toBe(true);
    expect(payload.context_preview.selected_context.find((item) => item.id === "workbook")?.status).toBe("blocked");
    expect(payload.verification_checks.find((item) => item.id === "citation-coverage")?.status).toBe("blocked");
  });

  it("requires entitlement metadata for every selected source", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    const result = await runWeeklyUpdate({ inputPath: fixturePath });
    const payload = weeklyUpdateDemoPayload({ input, result, fixtureId: "fixture" });
    const sourceIds = new Set(payload.run_history.sources.map((source) => source.id));
    const entitlementIds = new Set(payload.entitlement_ledger.map((source) => source.source_id));
    for (const id of sourceIds) {
      expect(entitlementIds.has(id)).toBe(true);
    }
  });

  it("does not include real vendor names, customer data, or secrets", async () => {
    const input = await readWeeklyUpdateInput(fixturePath);
    const result = await runWeeklyUpdate({ inputPath: fixturePath });
    const payload = weeklyUpdateDemoPayload({ input, result, fixtureId: "fixture" });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toMatch(/Bloomberg|FactSet|CapIQ|PitchBook|Third Bridge/i);
    expect(serialized).not.toMatch(/sk-[a-z0-9]/i);
    expect(serialized).not.toMatch(/customer\.com|client confidential/i);
  });
});
