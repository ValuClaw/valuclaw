import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { approvalAudit, requireApprovalForExternalAction } from "./approval.js";
import { AppendOnlyAuditLog, auditEvent } from "./audit-log.js";
import { JsonRunHistoryStore } from "./history-store.js";
import { assembleWeeklyUpdateManifest } from "./manifest.js";
import { artifactFromModelText, MockModelProvider, type ModelProvider } from "./model-adapter.js";
import { loadSkill } from "./skill-loader.js";
import { createDefaultToolRegistry } from "./tool-registry.js";
import type { Artifact, ModelRef, WeeklyUpdateInput, WeeklyUpdateRunResult } from "./types.js";

export interface WeeklyUpdateRunOptions {
  inputPath: string;
  outDir?: string;
  historyPath?: string;
  provider?: ModelProvider;
  model?: ModelRef;
  excludeWorkbook?: boolean;
}

export async function readWeeklyUpdateInput(path: string): Promise<WeeklyUpdateInput> {
  return JSON.parse(await readFile(path, "utf8")) as WeeklyUpdateInput;
}

export async function runWeeklyUpdate(options: WeeklyUpdateRunOptions): Promise<WeeklyUpdateRunResult> {
  const input = await readWeeklyUpdateInput(options.inputPath);
  if (options.model) {
    input.model = options.model;
  }
  if (options.excludeWorkbook) {
    input.includeWorkbook = false;
  }
  const skill = await loadSkill(input.skillPath);
  const manifest = assembleWeeklyUpdateManifest(input, skill);
  const toolRegistry = createDefaultToolRegistry();
  const auditEvents = [
    auditEvent({
      actor: input.actor,
      tenant: input.tenant,
      type: "retrieval",
      purpose: "Assemble selected synthetic context.",
      sources: manifest.sources,
      result: { excluded: manifest.excluded ?? [] }
    })
  ];

  for (const toolName of manifest.tools ?? []) {
    const tool = toolRegistry.find((item) => item.name === toolName);
    if (!tool) continue;
    const result = await tool.run(input);
    auditEvents.push(
      auditEvent({
        actor: input.actor,
        tenant: input.tenant,
        type: "tool_call",
        purpose: tool.description,
        params: { tool: tool.name, data_class: tool.dataClass },
        result
      })
    );
  }

  const provider = options.provider ?? new MockModelProvider();
  const completion = await provider.complete({ manifest, input });
  const modelText = completion.text;
  auditEvents.push(
    auditEvent({
      actor: input.actor,
      tenant: input.tenant,
      type: "model_call",
      purpose: "Draft weekly update from explicit context manifest.",
      model: manifest.model,
      inputs: manifest,
      sources: manifest.sources,
      result: {
        provider_id: provider.id,
        requested_model_id: manifest.model.id,
        resolved_model_id: completion.resolvedModelId
      }
    })
  );

  const artifact = artifactFromModelText(modelText, input);
  auditEvents.push(
    auditEvent({
      actor: input.actor,
      tenant: input.tenant,
      type: "artifact",
      purpose: artifact.blocked ? "Return blocked draft state." : "Create local draft artifact.",
      result: { id: artifact.id, blocked: artifact.blocked, kind: artifact.kind }
    })
  );

  const approval = requireApprovalForExternalAction("Outlook send or shared-location save");
  auditEvents.push(
    auditEvent({
      actor: input.actor,
      tenant: input.tenant,
      type: "approval",
      purpose: approval.reason,
      approval: approvalAudit(approval)
    })
  );

  const result = {
    manifest,
    artifact,
    auditEvents,
    memory: input.memory ?? [],
    modelExecution: {
      providerId: provider.id,
      requestedModelId: manifest.model.id,
      resolvedModelId: completion.resolvedModelId
    }
  };
  if (options.outDir) {
    await writeRunOutput(options.outDir, result);
  }
  if (options.historyPath) {
    await new JsonRunHistoryStore(options.historyPath).appendWeeklyUpdate(result);
  }
  return result;
}

export async function writeRunOutput(outDir: string, result: WeeklyUpdateRunResult): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "context-manifest.json"), `${JSON.stringify(result.manifest, null, 2)}\n`, "utf8");
  await writeFile(join(outDir, "artifact.md"), artifactMarkdown(result.artifact), "utf8");
  await writeFile(join(outDir, "memory-export.json"), `${JSON.stringify(result.memory, null, 2)}\n`, "utf8");
  const auditLog = new AppendOnlyAuditLog(join(outDir, "audit.ndjson"));
  await auditLog.appendMany(result.auditEvents);
}

function artifactMarkdown(artifact: Artifact): string {
  return [
    `# ${artifact.title}`,
    "",
    artifact.body,
    "",
    "## Citations",
    ...(artifact.citations.length
      ? artifact.citations.map((source) => `- ${source.citation ?? source.id} (${source.provider}, ${source.as_of})`)
      : ["- none"]),
    "",
    "## Review flags",
    ...(artifact.review_flags.length ? artifact.review_flags.map((flag) => `- ${flag}`) : ["- none"]),
    ""
  ].join("\n");
}
