import { getOffice } from "./office-shim.js";

interface WeeklyUpdateResponse {
  blocked: boolean;
  artifactHtml: string;
  artifactText: string;
  lineage: string[];
  approval: string;
  historyEntry: string;
  model: string;
  dataDestination: string;
}

function init() {
  const generate = mustGet<HTMLButtonElement>("generate");
  generate.addEventListener("click", async () => {
    generate.disabled = true;
    mustGet("status").textContent = "running";
    mustGet("approval").textContent = "Assembling only the context you selected...";
    try {
      const response = await fetch("/api/runs/weekly-update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: mustGet<HTMLSelectElement>("model").value,
          includeWorkbook: mustGet<HTMLInputElement>("include-workbook").checked
        })
      });
      const payload = (await response.json()) as WeeklyUpdateResponse | { error?: string };
      if (!response.ok || !("artifactText" in payload)) {
        throw new Error("error" in payload ? payload.error : "The local ValuClaw service did not return a run.");
      }
      renderRun(payload);
    } catch (error) {
      mustGet("status").textContent = "needs attention";
      mustGet("approval").textContent = error instanceof Error ? error.message : String(error);
    } finally {
      generate.disabled = false;
    }
  });
}

function renderRun(run: WeeklyUpdateResponse) {
  mustGet("artifact").textContent = run.artifactText;
  mustGet("lineage").textContent = run.lineage.length ? run.lineage.join(" | ") : "No lineage because the draft is blocked.";
  mustGet("approval").textContent = `${run.approval} Model path: ${run.model}. Context destination: ${run.dataDestination}.`;
  mustGet("status").textContent = run.blocked ? "blocked" : "ready for review";
  const history = mustGet("history");
  history.innerHTML = `<div>${run.historyEntry}</div>${history.innerHTML === "No preserved runs yet." ? "" : history.innerHTML}`;
  if (!run.blocked) {
    insertIntoOffice(run.artifactHtml);
  }
}

function insertIntoOffice(html: string) {
  const office = getOffice();
  const document = office?.context?.document;
  if (!document) return;
  document.setSelectedDataAsync(
    html,
    { coercionType: office?.CoercionType?.Html ?? "html" },
    (result) => {
      if (result.status === office?.AsyncResultStatus?.Failed) {
        mustGet("approval").textContent = `Office insertion failed: ${result.error?.message ?? "unknown error"}`;
      }
    }
  );
}

function mustGet<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing taskpane element: ${id}`);
  }
  return element as T;
}

const office = getOffice();
if (office) {
  office.onReady(init);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
