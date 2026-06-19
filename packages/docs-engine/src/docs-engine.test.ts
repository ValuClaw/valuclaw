import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { readZipText } from "./zip-inspect.js";
import { renderTemplate, writeDocxFromTemplate } from "./docx.js";
import { writePptxSummary } from "./pptx.js";
import { readXlsxCompact, writeXlsxWithLineage } from "./xlsx.js";
import type { LineageRef } from "./types.js";

const lineage: LineageRef[] = [
  {
    id: "wb:Model_v12.xlsx#Revenue Build!B2",
    label: "Revenue Build - B2",
    source: "Model_v12.xlsx",
    address: "B2",
    asOf: "2026-06-19T08:14:00Z"
  }
];

describe("docs-engine", () => {
  it("reads .xlsx into compact cells with lineage", async () => {
    const dir = await mkdtemp(join(tmpdir(), "valuclaw-docs-"));
    const path = join(dir, "model.xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Metric", "Value"],
        ["FY24 revenue", 48.2]
      ]),
      "Revenue Build"
    );
    XLSX.writeFile(workbook, path);
    const compact = readXlsxCompact(path);
    expect(compact.sheets[0].name).toBe("Revenue Build");
    expect(compact.sheets[0].cells.some((cell) => cell.address === "B2" && cell.value === 48.2)).toBe(true);
    expect(compact.sheets[0].cells.find((cell) => cell.address === "B2")?.lineage?.label).toBe("Revenue Build - B2");
  });

  it("generates a .docx from a template and carries source lineage", async () => {
    const dir = await mkdtemp(join(tmpdir(), "valuclaw-docx-"));
    const path = join(dir, "memo.docx");
    const rendered = renderTemplate("Revenue reached {{revenue}}.", { revenue: "$48.2M" });
    expect(rendered).toBe("Revenue reached $48.2M.");
    await writeDocxFromTemplate(path, {
      title: "Weekly Update",
      template: "Revenue reached {{revenue}}.",
      variables: { revenue: "$48.2M" },
      lineage
    });
    const xml = await readZipText(path, "word/document.xml");
    expect(xml).toContain("Weekly Update");
    expect(xml).toContain("Revenue reached $48.2M.");
    expect(xml).toContain("Revenue Build - B2");
  });

  it("writes .xlsx outputs with a lineage sheet", async () => {
    const dir = await mkdtemp(join(tmpdir(), "valuclaw-xlsx-"));
    const path = join(dir, "review.xlsx");
    await writeXlsxWithLineage(
      path,
      [{ name: "Review", rows: [{ item: "Churn changed", status: "needs review" }] }],
      lineage
    );
    const compact = readXlsxCompact(path);
    expect(compact.sheets.some((sheet) => sheet.name === "ValuClaw_Lineage")).toBe(true);
    expect(
      compact.sheets
        .find((sheet) => sheet.name === "ValuClaw_Lineage")
        ?.cells.some((cell) => cell.value === "Revenue Build - B2")
    ).toBe(true);
  });

  it("writes .pptx summaries with lineage notes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "valuclaw-pptx-"));
    const path = join(dir, "summary.pptx");
    await writePptxSummary(path, {
      title: "Weekly Update",
      bullets: ["Revenue reached $48.2M", "Churn assumption needs review"],
      lineage
    });
    const xml = await readZipText(path, "ppt/slides/slide1.xml");
    expect(xml).toContain("Weekly Update");
    expect(xml).toContain("Revenue reached $48.2M");
    expect(xml).toContain("Revenue Build - B2");
  });
});
