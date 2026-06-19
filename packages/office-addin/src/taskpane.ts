import { createSyntheticRun } from "./synthetic-run.js";
import { getOffice } from "./office-shim.js";

function init() {
  const generate = mustGet<HTMLButtonElement>("generate");
  generate.addEventListener("click", () => {
    const model = mustGet<HTMLSelectElement>("model").value === "local" ? "local" : "mock";
    const includeWorkbook = mustGet<HTMLInputElement>("include-workbook").checked;
    const run = createSyntheticRun({
      model,
      skill: "skill.weekly_update@0.1.0",
      includeWorkbook
    });
    mustGet("artifact").textContent = run.artifactText;
    mustGet("lineage").textContent = run.lineage.length ? run.lineage.join(" | ") : "No lineage because the draft is blocked.";
    mustGet("approval").textContent = run.approval;
    mustGet("status").textContent = run.blocked ? "blocked" : "ready for review";
    const history = mustGet("history");
    history.innerHTML = `<div>${run.historyEntry}</div>${history.innerHTML === "No preserved runs yet." ? "" : history.innerHTML}`;
    if (!run.blocked) {
      insertIntoOffice(run.artifactHtml);
    }
  });
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
