import { getOffice } from "./office-shim.js";

const MODEL_ROSTER_KEY = "valuclaw.openrouter-model-roster";
const DEFAULT_MODEL_ROSTER = [
  "openai/gpt-5.4-mini",
  "anthropic/claude-opus-4.8",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3.5-flash",
  "deepseek/deepseek-v4-flash"
];

interface WeeklyUpdateResponse {
  blocked: boolean;
  artifactHtml: string;
  artifactText: string;
  lineage: string[];
  approval: string;
  historyEntry: string;
  model: string;
  requestedModel: string;
  dataDestination: string;
}

function init() {
  const generate = mustGet<HTMLButtonElement>("generate");
  restoreModelRoster();
  mustGet<HTMLButtonElement>("save-model-options").addEventListener("click", saveModelRoster);
  generate.addEventListener("click", async () => {
    generate.disabled = true;
    mustGet("status").textContent = "running";
    mustGet("approval").textContent = "Assembling only the context you selected...";
    try {
      const response = await fetch("/api/runs/weekly-update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          includeWorkbook: mustGet<HTMLInputElement>("include-workbook").checked,
          modelId: mustGet<HTMLSelectElement>("model-route").value,
          modelRoster: readModelRoster()
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

function restoreModelRoster() {
  const roster = readModelRoster();
  mustGet<HTMLTextAreaElement>("model-options").value = roster.join("\n");
  populateModelRoute(roster);
  mustGet("model-options-status").textContent = "Auto routes only within this saved roster.";
}

function saveModelRoster() {
  const roster = parseModelRoster(mustGet<HTMLTextAreaElement>("model-options").value);
  if (!roster.length) {
    mustGet("model-options-status").textContent = "Enter at least one OpenRouter model ID.";
    return;
  }
  localStorage.setItem(MODEL_ROSTER_KEY, JSON.stringify(roster));
  mustGet<HTMLTextAreaElement>("model-options").value = roster.join("\n");
  populateModelRoute(roster);
  mustGet("model-options-status").textContent = `${roster.length} model ${roster.length === 1 ? "option" : "options"} saved locally.`;
}

function readModelRoster() {
  try {
    const stored = localStorage.getItem(MODEL_ROSTER_KEY);
    if (!stored) return DEFAULT_MODEL_ROSTER;
    const value = JSON.parse(stored);
    return Array.isArray(value) ? parseModelRoster(value.join("\n")) : DEFAULT_MODEL_ROSTER;
  } catch {
    return DEFAULT_MODEL_ROSTER;
  }
}

function parseModelRoster(value: string) {
  return Array.from(new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(isOpenRouterModelId))).slice(0, 5);
}

function populateModelRoute(roster: string[]) {
  const select = mustGet<HTMLSelectElement>("model-route");
  const selected = select.value;
  select.replaceChildren(new Option("Auto", "auto"), ...roster.map((modelId) => new Option(modelId, modelId)));
  select.value = roster.includes(selected) || selected === "auto" ? selected : "auto";
}

function isOpenRouterModelId(value: string) {
  return /^[a-z0-9][a-z0-9._:-]{0,63}\/[a-z0-9][a-z0-9._:-]{0,127}$/i.test(value);
}

function renderRun(run: WeeklyUpdateResponse) {
  mustGet("artifact").textContent = run.artifactText;
  mustGet("lineage").textContent = run.lineage.length ? run.lineage.join(" | ") : "No lineage because the draft is blocked.";
  mustGet("approval").textContent = `${run.approval} Model route: ${run.requestedModel} → ${run.model}. Context destination: ${run.dataDestination}.`;
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
