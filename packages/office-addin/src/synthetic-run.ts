export interface AddinRunOptions {
  model: "mock" | "local";
  skill: "skill.weekly_update@0.1.0";
  includeWorkbook: boolean;
}

export interface AddinRun {
  blocked: boolean;
  artifactHtml: string;
  artifactText: string;
  lineage: string[];
  approval: string;
  historyEntry: string;
}

export function createSyntheticRun(options: AddinRunOptions): AddinRun {
  if (!options.includeWorkbook) {
    const blocked = "Workbook context is excluded. Include the workbook before drafting model commentary.";
    return {
      blocked: true,
      artifactHtml: `<p><strong>Blocked:</strong> ${blocked}</p>`,
      artifactText: `Blocked: ${blocked}`,
      lineage: [],
      approval: "No external action available while blocked.",
      historyEntry: `${new Date().toISOString()} - blocked weekly update (${options.model})`
    };
  }

  const artifactText = [
    "Weekly Investment Update",
    "",
    "Topline reached $48.2M in FY24 (Revenue Build - cell F87), up 21% YoY.",
    "Net leverage held at 3.1x (Debt Schedule - cell D40).",
    "The base case assumes 4.0% churn (Assumptions - cell C19), changed from 3.2%; flagged for review.",
    "",
    "Open items: confirm the churn assumption change with the deal team."
  ].join("\n");

  return {
    blocked: false,
    artifactText,
    artifactHtml: [
      "<h2>Weekly Investment Update</h2>",
      "<p>Topline reached <strong>$48.2M</strong> in FY24 (<em>Revenue Build - cell F87</em>), up <strong>21% YoY</strong>.</p>",
      "<p>Net leverage held at <strong>3.1x</strong> (<em>Debt Schedule - cell D40</em>).</p>",
      "<p>The base case assumes <strong>4.0% churn</strong> (<em>Assumptions - cell C19</em>), changed from 3.2%; flagged for review.</p>",
      "<p><strong>Open items:</strong> confirm the churn assumption change with the deal team.</p>"
    ].join(""),
    lineage: ["Revenue Build - cell F87", "Debt Schedule - cell D40", "Assumptions - cell C19"],
    approval: "Pending before Outlook send or shared-location save.",
    historyEntry: `${new Date().toISOString()} - weekly update generated (${options.model})`
  };
}
