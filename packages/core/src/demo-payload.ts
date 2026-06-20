import type { DemoPayload, DemoStatusItem, WeeklyUpdateInput, WeeklyUpdateRunResult } from "./types.js";

export interface WeeklyUpdateDemoPayloadOptions {
  result: WeeklyUpdateRunResult;
  input: WeeklyUpdateInput;
  fixtureId: string;
  openCoreCommit?: string;
}

export function weeklyUpdateDemoPayload(options: WeeklyUpdateDemoPayloadOptions): DemoPayload {
  const { result, input, fixtureId } = options;
  const approvedMemory = result.memory.filter((item) => item.approved);
  const rejectedMemory = result.memory.filter((item) => !item.approved);
  const workbookSources = result.manifest.sources?.filter((source) => source.provider === "workbook") ?? [];
  const marketSources = result.manifest.sources?.filter((source) => source.provider !== "workbook") ?? [];
  const blocked = result.artifact.blocked;

  return {
    schema_version: "0.1.0",
    generated_by: "ValuClaw open-core",
    fixture_id: fixtureId,
    synthetic_only: true,
    open_core_commit: options.openCoreCommit ?? "unknown",
    workflow: {
      id: "workflow.weekly_investment_update",
      title: "Weekly investment update",
      persona: "Investment professional preparing a reviewer-ready update",
      artifact: "Word section for the weekly IC pack",
      reviewer: "Senior reviewer",
      approval_path: "Draft only until reviewer approves send/save",
      steps: [
        item("map", "Workflow mapped", "pass", "Inputs, output, reviewer, and approval path are explicit."),
        item("context", "Context selected", blocked ? "blocked" : "pass", blocked ? "Workbook excluded by user." : "Workbook, approved data, skill, and approved memory selected."),
        item("draft", "Office draft prepared", blocked ? "blocked" : "review", blocked ? "No numerical draft without workbook context." : "Draft is ready for review with source chips attached."),
        item("approval", "External action gated", "pending", "No Outlook send or shared-location save until approval.")
      ]
    },
    context_preview: {
      model: result.manifest.model,
      skill: result.manifest.skill,
      selected_context: [
        item("skill", `Skill ${result.manifest.skill.id} v${result.manifest.skill.version}`, "pass", "Versioned procedure included in the model call."),
        item("workbook", input.workbook?.id ?? "Workbook", blocked ? "blocked" : "pass", blocked ? "Excluded, so model commentary is blocked." : `${input.workbook?.tabs.join(", ")} included as traceable context.`),
        item("market-data", "Approved market-data quote", marketSources.length ? "pass" : "pending", marketSources.length ? "Included as a customer-approved source ref." : "No approved market-data source selected."),
        item("memory", "Approved memory", approvedMemory.length ? "pass" : "pending", approvedMemory.length ? `${approvedMemory.length} approved memory item included.` : "No approved memory selected.")
      ],
      excluded_context: [
        ...((result.manifest.excluded ?? []).map((excluded) => item(excluded.id, excluded.id, "blocked", excluded.reason))),
        ...rejectedMemory.map((memory) => item(memory.id, memory.id, "review", "Candidate memory is visible but excluded until approved."))
      ],
      approved_memory: result.manifest.memory ?? [],
      rejected_memory: rejectedMemory
    },
    permission_preview: {
      will_read: [
        item("read-workbook", input.workbook?.id ?? "Model workbook", blocked ? "blocked" : "pass", blocked ? "Not read because user excluded it." : "Selected workbook tabs only."),
        item("read-market-data", "Approved data source", marketSources.length ? "pass" : "pending", "Synthetic customer-approved source ref only."),
        item("read-memory", "Approved memory", approvedMemory.length ? "pass" : "pending", "Only approved memory IDs enter context.")
      ],
      will_not_touch: [
        item("no-all-mail", "Mailbox", "pass", "No broad mailbox access."),
        item("no-sharepoint-crawl", "SharePoint", "pass", "No drive-wide crawl."),
        item("no-crm-write", "CRM", "pass", "No CRM write in this workflow.")
      ],
      external_actions: [
        item("outlook-send", "Outlook send", "pending", "Approval required before send."),
        item("shared-save", "Shared-location save", "pending", "Approval required before save.")
      ]
    },
    policy_checks: [
      item("model-policy", "Model allowed for synthetic/internal-model context", "pass", `${result.manifest.model.id} is in the manifest allowlist.`),
      item("tool-policy", "Tools constrained to workflow", "pass", `${result.manifest.tools?.join(", ") ?? "No tools"} allowed for this run.`),
      item("external-action-policy", "Human approval required", "pass", "Send/save actions are pending approval."),
      item("memory-policy", "Rejected memory excluded", "pass", "Candidate memory is shown to the user but not included in model context."),
      item("untrusted-content-policy", "Source documents are facts, not instructions", "pass", "Workflow treats source context as evidence only.")
    ],
    entitlement_ledger: [
      ...workbookSources.map((source) => ({
        source_id: source.id,
        source_label: source.citation ?? source.id,
        provider: source.provider,
        as_of: source.as_of,
        may_retrieve: true,
        may_quote: true,
        may_summarize: true,
        may_cache: false,
        may_redistribute: false,
        may_enter_model_context: true,
        detail: "Synthetic workbook context selected by user; not redistributable outside this demo."
      })),
      ...marketSources.map((source) => ({
        source_id: source.id,
        source_label: source.citation ?? source.id,
        provider: source.provider,
        as_of: source.as_of,
        may_retrieve: true,
        may_quote: false,
        may_summarize: true,
        may_cache: false,
        may_redistribute: false,
        may_enter_model_context: true,
        detail: "Synthetic approved-data source; summary use only, no redistribution."
      }))
    ],
    artifact_preview: {
      target: input.outputTarget,
      title: result.artifact.title,
      blocked,
      sections: blocked
        ? [
            {
              id: "blocked",
              heading: "Draft blocked",
              body: result.artifact.body,
              source_ids: []
            }
          ]
        : [
            {
              id: "topline",
              heading: "Topline and leverage",
              body: `Topline reached ${input.workbook?.revenue_fy24} in FY24, up ${input.workbook?.revenue_yoy} YoY. Net leverage held at ${input.workbook?.leverage}.`,
              source_ids: workbookSources.map((source) => source.id)
            },
            {
              id: "assumption-review",
              heading: "Assumption requiring review",
              body: `The base case assumes ${input.workbook?.churn_current} churn, changed from ${input.workbook?.churn_prior}; confirm with the deal team before distribution.`,
              source_ids: workbookSources.map((source) => source.id)
            },
            {
              id: "open-items",
              heading: "Open review items",
              body: "Confirm churn assumption change, then approve the Outlook draft or shared-folder save.",
              source_ids: []
            }
          ],
      citations: result.artifact.citations,
      review_flags: result.artifact.review_flags
    },
    redlines: [
      {
        id: "redline.churn",
        label: "Assumption changed",
        before: `Churn assumption ${input.workbook?.churn_prior ?? "n/a"}`,
        after: `Churn assumption ${input.workbook?.churn_current ?? "n/a"}`,
        action: "accept",
        status: blocked ? "rejected" : "proposed"
      },
      {
        id: "redline.memory",
        label: "Candidate memory rejected",
        before: rejectedMemory[0]?.body ?? "No candidate memory",
        after: "Excluded from model context until user approves it.",
        action: "reject",
        status: "rejected"
      }
    ],
    verification_checks: [
      item("citation-coverage", "Citation coverage", blocked ? "blocked" : "pass", blocked ? "No material claims drafted." : "Every material figure in the draft has a source ref."),
      item("numeric-trace", "Numerical traceability", blocked ? "blocked" : "pass", blocked ? "Workbook excluded." : "Revenue and leverage tie to workbook cells."),
      item("stale-source", "Stale source check", "pass", "Synthetic sources share the same as-of timestamp."),
      item("unsupported-claim", "Unsupported claim guard", "pass", "Draft is constrained to selected context and open items.")
    ],
    approvals: [
      item("reviewer", "Reviewer approval", "pending", "Required before this leaves draft state."),
      item("external-send-save", "Send/save approval", "pending", "No external action performed.")
    ],
    run_history: {
      id: "run.weekly_update.synthetic",
      ts: result.auditEvents[0]?.ts ?? new Date(0).toISOString(),
      model: result.manifest.model,
      skill: result.manifest.skill,
      sources: result.manifest.sources ?? [],
      approved_memory_ids: approvedMemory.map((memory) => memory.id),
      audit_event_ids: result.auditEvents.map((event) => event.id),
      approval_status: "pending",
      searchable_terms: ["weekly update", input.workbook?.id ?? "workbook", result.manifest.skill.id, result.manifest.model.id]
    }
  };
}

function item(id: string, label: string, status: DemoStatusItem["status"], detail: string): DemoStatusItem {
  return { id, label, status, detail };
}
