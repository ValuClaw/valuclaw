import { runWeeklyUpdate } from "@valuclaw/core";

export interface EvalCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export async function evaluateWeeklyUpdate(inputPath: string): Promise<EvalCheck[]> {
  const normal = await runWeeklyUpdate({ inputPath });
  const blocked = await runWeeklyUpdate({ inputPath, excludeWorkbook: true });
  const materialFigures = ["$48.2M", "21%", "3.1x", "4.0%"];
  const citedFigures = materialFigures.filter((figure) => normal.artifact.body.includes(figure));
  const citationCoverage = normal.artifact.citations.length > 0 && citedFigures.length === materialFigures.length;
  return [
    {
      name: "citation coverage = 100%",
      passed: citationCoverage,
      detail: `${citedFigures.length}/${materialFigures.length} material figures present with lineage refs`
    },
    {
      name: "blocks when workbook is excluded",
      passed: blocked.artifact.blocked && blocked.manifest.excluded?.some((item) => item.id === "selected:workbook") === true,
      detail: blocked.artifact.body
    }
  ];
}
