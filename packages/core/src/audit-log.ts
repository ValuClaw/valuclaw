import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { nowIso, stableId } from "./id.js";
import type { AuditEvent, AuditEventType, ModelRef, SourceRef } from "./types.js";

export function auditEvent(input: {
  actor: string;
  tenant: string;
  type: AuditEventType;
  purpose: string;
  inputs?: unknown;
  params?: unknown;
  sources?: SourceRef[];
  model?: ModelRef;
  result?: unknown;
  approval?: AuditEvent["approval"];
}): AuditEvent {
  const ts = nowIso();
  return {
    id: stableId("audit", { ...input, ts }),
    ts,
    actor: input.actor,
    tenant: input.tenant,
    type: input.type,
    purpose: input.purpose,
    inputs: input.inputs,
    params: input.params,
    sources: input.sources,
    model: input.model,
    result: input.result,
    approval: input.approval
  };
}

export class AppendOnlyAuditLog {
  constructor(private readonly path: string) {}

  async append(event: AuditEvent): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    let existing = "";
    try {
      existing = await readFile(this.path, "utf8");
    } catch {
      existing = "";
    }
    await writeFile(this.path, `${existing}${JSON.stringify(event)}\n`, "utf8");
  }

  async appendMany(events: AuditEvent[]): Promise<void> {
    for (const event of events) {
      await this.append(event);
    }
  }
}
