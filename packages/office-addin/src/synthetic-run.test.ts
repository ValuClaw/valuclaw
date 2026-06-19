import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createSyntheticRun } from "./synthetic-run.js";

describe("office add-in synthetic run", () => {
  it("creates an insertable synthetic Word artifact with lineage and approval state", () => {
    const run = createSyntheticRun({
      model: "mock",
      skill: "skill.weekly_update@0.1.0",
      includeWorkbook: true
    });
    expect(run.blocked).toBe(false);
    expect(run.artifactHtml).toContain("Weekly Investment Update");
    expect(run.lineage).toContain("Revenue Build - cell F87");
    expect(run.approval).toContain("Pending");
  });

  it("blocks commentary when workbook context is excluded", () => {
    const run = createSyntheticRun({
      model: "mock",
      skill: "skill.weekly_update@0.1.0",
      includeWorkbook: false
    });
    expect(run.blocked).toBe(true);
    expect(run.artifactText).toContain("Workbook context is excluded");
    expect(run.lineage).toHaveLength(0);
  });

  it("declares a Word task pane manifest for sideloading", async () => {
    const manifest = await readFile("packages/office-addin/manifest.xml", "utf8");
    expect(manifest).toContain('<Host Name="Document"/>');
    expect(manifest).toContain("https://localhost:3100/taskpane.html");
    expect(manifest).toContain("<Permissions>ReadWriteDocument</Permissions>");
  });
});
