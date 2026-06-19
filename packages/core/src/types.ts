export type ModelDeployment = "frontier" | "private" | "fast" | "local";

export interface ModelRef {
  id: string;
  routing_reason: string;
  deployment?: ModelDeployment;
}

export interface SkillRef {
  id: string;
  version: string;
}

export interface MemoryRef {
  id: string;
  scope: string;
  body?: string;
}

export interface SourceRef {
  id: string;
  provider: string;
  as_of: string;
  citation?: string;
}

export interface ExcludedContext {
  id: string;
  reason: string;
}

export interface ContextManifest {
  model: ModelRef;
  skill: SkillRef;
  memory?: MemoryRef[];
  sources?: SourceRef[];
  tools?: string[];
  policy?: {
    data_class?: string;
    model_allowlist?: string[];
  };
  data_classes: string[];
  workflow_state?: Record<string, unknown>;
  excluded?: ExcludedContext[];
}

export interface Skill {
  id: string;
  version: string;
  owner?: string;
  status?: string;
  path: string;
  purpose: string;
  raw: string;
  sections: Record<string, string>;
}

export type AuditEventType =
  | "tool_call"
  | "retrieval"
  | "model_call"
  | "approval"
  | "artifact"
  | "external_action";

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
  tenant: string;
  type: AuditEventType;
  purpose: string;
  inputs?: unknown;
  params?: unknown;
  sources?: SourceRef[];
  model?: ModelRef;
  result?: unknown;
  approval?: {
    required: boolean;
    status: "pending" | "approved" | "rejected" | "not_required";
    by?: string;
    at?: string;
  };
}

export interface WeeklyUpdateInput {
  actor: string;
  tenant: string;
  skillPath: string;
  includeWorkbook: boolean;
  outputTarget: "word-section" | "outlook-draft";
  model: ModelRef;
  workbook?: {
    id: string;
    as_of: string;
    tabs: string[];
    revenue_fy24: string;
    revenue_yoy: string;
    leverage: string;
    churn_current: string;
    churn_prior: string;
  };
  marketData?: SourceRef;
  notes?: string[];
  memory?: MemoryRecord[];
}

export interface MemoryRecord {
  id: string;
  scope: string;
  body: string;
  approved: boolean;
  updated_at: string;
}

export interface Artifact {
  id: string;
  kind: string;
  title: string;
  body: string;
  citations: SourceRef[];
  review_flags: string[];
  blocked: boolean;
}

export interface WeeklyUpdateRunResult {
  manifest: ContextManifest;
  artifact: Artifact;
  auditEvents: AuditEvent[];
  memory: MemoryRecord[];
}

export interface RunHistoryEntry {
  id: string;
  ts: string;
  workflow: string;
  skill: SkillRef;
  artifact: Pick<Artifact, "id" | "kind" | "title" | "blocked">;
  manifest: ContextManifest;
  audit_event_ids: string[];
}
