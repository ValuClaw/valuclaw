import type { AuditEvent } from "./types.js";

export interface ApprovalDecision {
  required: boolean;
  status: "pending" | "approved" | "rejected" | "not_required";
  reason: string;
}

export function requireApprovalForExternalAction(action: string): ApprovalDecision {
  return {
    required: true,
    status: "pending",
    reason: `Human approval required before ${action}.`
  };
}

export function approvalAudit(decision: ApprovalDecision): AuditEvent["approval"] {
  return {
    required: decision.required,
    status: decision.status
  };
}
