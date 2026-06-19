import type { WeeklyUpdateInput } from "./types.js";

export interface ToolDefinition<TOutput = unknown> {
  name: string;
  description: string;
  dataClass: string;
  run(input: WeeklyUpdateInput): Promise<TOutput>;
}

export interface WorkbookCheckResult {
  changed_assumptions: string[];
  broken_links: number;
  hardcodes: number;
}

export function createDefaultToolRegistry(): ToolDefinition[] {
  return [
    {
      name: "workbook_check",
      description: "Inspect synthetic workbook assumptions, broken links, hardcodes, and variances.",
      dataClass: "internal-model",
      async run(input) {
        if (!input.includeWorkbook || !input.workbook) {
          return {
            changed_assumptions: [],
            broken_links: 0,
            hardcodes: 0,
            blocked: true,
            reason: "Workbook excluded."
          };
        }
        return {
          changed_assumptions: [
            `churn ${input.workbook.churn_prior} -> ${input.workbook.churn_current}`
          ],
          broken_links: 0,
          hardcodes: 0
        } satisfies WorkbookCheckResult;
      }
    },
    {
      name: "data_retrieval",
      description: "Retrieve approved synthetic market-data source refs through the data-provider contract.",
      dataClass: "approved-market-data",
      async run(input) {
        return input.marketData ? [input.marketData] : [];
      }
    },
    {
      name: "artifact_ops",
      description: "Create local draft artifacts and source lists; no external send or shared save.",
      dataClass: "artifact",
      async run() {
        return { draft_only: true, external_action_performed: false };
      }
    },
    {
      name: "source_search",
      description: "Placeholder for public/permitted web source search. Disabled in the synthetic fixture.",
      dataClass: "public",
      async run() {
        return [];
      }
    },
    {
      name: "local_filesystem",
      description: "Read explicit local synthetic fixtures selected by the user.",
      dataClass: "local-file",
      async run() {
        return { synthetic_only: true };
      }
    }
  ];
}
