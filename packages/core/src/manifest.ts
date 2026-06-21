import { Ajv2020 } from "ajv/dist/2020.js";
import schema from "../../../schemas/context-manifest.schema.json" with { type: "json" };
import type { ContextManifest, MemoryRecord, Skill, SourceRef, WeeklyUpdateInput } from "./types.js";

const ajv = new Ajv2020({ strict: false, validateFormats: false });
const validate = ajv.compile(schema);

export function validateContextManifest(manifest: ContextManifest): void {
  if (!validate(manifest)) {
    throw new Error(`Invalid context manifest: ${ajv.errorsText(validate.errors)}`);
  }
}

export function assembleWeeklyUpdateManifest(input: WeeklyUpdateInput, skill: Skill): ContextManifest {
  const sources: SourceRef[] = [];
  const excluded: { id: string; reason: string }[] = [];
  const dataClasses = new Set<string>();

  if (input.includeWorkbook && input.workbook) {
    sources.push({
      id: `wb:${input.workbook.id}#Revenue Build!F87`,
      provider: "workbook",
      as_of: input.workbook.as_of,
      citation: "Revenue Build - cell F87"
    });
    sources.push({
      id: `wb:${input.workbook.id}#Debt Schedule!D40`,
      provider: "workbook",
      as_of: input.workbook.as_of,
      citation: "Debt Schedule - cell D40"
    });
    sources.push({
      id: `wb:${input.workbook.id}#Assumptions!C19`,
      provider: "workbook",
      as_of: input.workbook.as_of,
      citation: "Assumptions - cell C19"
    });
    dataClasses.add("internal-model");
  } else {
    excluded.push({
      id: "selected:workbook",
      reason: "Workbook excluded by user; block model commentary and traceable figures."
    });
  }

  if (input.marketData) {
    sources.push(input.marketData);
    dataClasses.add("approved-market-data");
  }

  const approvedMemory = approvedMemoryRefs(input.memory ?? []);
  if (approvedMemory.length > 0) {
    dataClasses.add("approved-memory");
  }

  const manifest: ContextManifest = {
    model: input.model,
    skill: { id: skill.id, version: skill.version },
    memory: approvedMemory,
    sources,
    tools: input.includeWorkbook ? ["workbook_check", "artifact_ops"] : ["artifact_ops"],
    policy: {
      data_class: "synthetic",
      model_allowlist: [input.model.id, "mock"]
    },
    data_classes: [...dataClasses],
    workflow_state: {
      output_target: input.outputTarget,
      workbook_included: input.includeWorkbook,
      approval_required_before_external_action: true
    },
    excluded
  };
  validateContextManifest(manifest);
  return manifest;
}

function approvedMemoryRefs(memory: MemoryRecord[]) {
  return memory
    .filter((item) => item.approved)
    .map((item) => ({
      id: item.id,
      scope: item.scope,
      body: item.body
    }));
}
