import { createServer } from "node:https";
import { readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { OpenAICompatibleProvider, runWeeklyUpdate } from "../packages/core/dist/index.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const staticRoot = join(projectRoot, "packages", "office-addin", "dist");
const fixturePath = join(projectRoot, "fixtures", "weekly-update", "input.json");
const stateRoot = resolve(process.env.VALUCLAW_STATE_DIR ?? join(projectRoot, ".valuclaw"));
const port = Number(process.env.VALUCLAW_OFFICE_PORT ?? "3100");
const certificateRoot = resolve(process.env.VALUCLAW_CERT_DIR ?? join(homedir(), ".office-addin-dev-certs"));
const certificatePath = join(certificateRoot, "localhost.crt");
const keyPath = join(certificateRoot, "localhost.key");
const DEFAULT_MODEL_ROSTER = [
  "openai/gpt-5.4-mini",
  "anthropic/claude-opus-4.8",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3.5-flash",
  "deepseek/deepseek-v4-flash"
];

await assertCertificateFiles();

const server = createServer(
  {
    cert: await readFile(certificatePath),
    key: await readFile(keyPath)
  },
  async (request, response) => {
    try {
      if (request.method === "POST" && request.url === "/api/runs/weekly-update") {
        await runWeeklyUpdateRequest(request, response);
        return;
      }
      if (request.method === "GET" && request.url === "/api/health") {
        sendJson(response, 200, {
          status: "ok",
          stateRoot,
          openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY)
        });
        return;
      }
      if (request.method === "GET") {
        await serveStatic(request, response);
        return;
      }
      sendJson(response, 405, { error: "Method not allowed." });
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }
);

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`ValuClaw Word bridge listening at https://localhost:${port}\n`);
  process.stdout.write(`State stays local: ${stateRoot}\n`);
  process.stdout.write("Use Ctrl+C to stop the local bridge.\n");
});

server.on("error", (error) => {
  process.stderr.write(`Unable to start the ValuClaw Word bridge: ${error.message}\n`);
  process.exitCode = 1;
});

async function runWeeklyUpdateRequest(request, response) {
  const payload = await readJson(request);
  const includeWorkbook = payload.includeWorkbook !== false;
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const runRoot = join(stateRoot, "runs", `word-${timestamp}`);
  const modelConfiguration = openRouterConfiguration(payload.modelId, payload.modelRoster);
  const result = await runWeeklyUpdate({
    inputPath: fixturePath,
    outDir: runRoot,
    historyPath: join(stateRoot, "history.json"),
    excludeWorkbook: !includeWorkbook,
    ...modelConfiguration
  });
  sendJson(response, 200, {
    blocked: result.artifact.blocked,
    artifactHtml: artifactHtml(result.artifact.body),
    artifactText: result.artifact.body,
    lineage: result.artifact.citations.map((citation) => citation.citation ?? citation.id),
    approval: "Pending before Outlook send or shared-location save.",
    historyEntry: `${new Date().toISOString()} - weekly update generated (${result.manifest.model.id})`,
    model: result.modelExecution.resolvedModelId ?? result.manifest.model.id,
    requestedModel: result.manifest.model.id,
    dataDestination: modelConfiguration.destination,
    manifest: result.manifest,
    auditEventIds: result.auditEvents.map((event) => event.id)
  });
}

function openRouterConfiguration(modelId, suppliedRoster) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter is not configured. Set OPENROUTER_API_KEY, then restart pnpm office:serve.");
  }
  const maxTokens = positiveInteger(process.env.VALUCLAW_MAX_TOKENS ?? process.env.VALUCLAW_MODEL_MAX_TOKENS, 240);
  const selectedRoute = modelRoute(modelId, suppliedRoster);
  return {
    provider: new OpenAICompatibleProvider({
      baseUrl: "https://openrouter.ai/api/v1",
      model: selectedRoute.id,
      apiKey,
      maxTokens,
      extraHeaders: {
        "http-referer": "https://www.valuclaw.com",
        "x-title": "ValuClaw Word synthetic workflow proof"
      },
      requestExtras: selectedRoute.requestExtras
    }),
    model: {
      id: selectedRoute.id,
      routing_reason: selectedRoute.reason,
      deployment: "frontier"
    },
    destination: selectedRoute.destination
  };
}

function modelRoute(modelId, suppliedRoster) {
  const roster = modelRoster(suppliedRoster);
  if (modelId && modelId !== "auto") {
    if (!roster.includes(modelId)) {
      throw new Error("Choose a model from the saved roster.");
    }
    return pinnedModelRoute(modelId);
  }
  return {
    id: "openrouter/auto",
    reason: "OpenRouter Auto Router selects a model for this workflow.",
    destination: "OpenRouter Auto Router; the routed model is recorded with this run.",
    requestExtras: {
      plugins: [
        {
          id: "auto-router",
          allowed_models: roster,
          cost_quality_tradeoff: 6
        }
      ]
    }
  };
}

function modelRoster(value) {
  if (!Array.isArray(value)) return DEFAULT_MODEL_ROSTER;
  const roster = [...new Set(value.filter((item) => typeof item === "string" && isOpenRouterModelId(item)))].slice(0, 5);
  return roster.length ? roster : DEFAULT_MODEL_ROSTER;
}

function isOpenRouterModelId(value) {
  return /^[a-z0-9][a-z0-9._:-]{0,63}\/[a-z0-9][a-z0-9._:-]{0,127}$/i.test(value);
}

function pinnedModelRoute(id) {
  return {
    id,
    reason: `The user pinned ${id} for this workflow run.`,
    destination: `OpenRouter; ${id} is recorded with this run.`,
    requestExtras: undefined
  };
}

function positiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("VALUCLAW_MAX_TOKENS must be a positive integer.");
  }
  return parsed;
}

async function serveStatic(request, response) {
  const rawPath = request.url === "/" ? "/taskpane.html" : request.url ?? "/taskpane.html";
  const path = normalize(rawPath.split("?")[0]).replace(/^[/\\]+/, "");
  const filePath = resolve(staticRoot, path);
  if (!filePath.startsWith(`${staticRoot}${sep}`)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }
  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-store",
      "access-control-allow-origin": `https://localhost:${port}`
    });
    response.end(file);
  } catch {
    sendJson(response, 404, { error: "Not found." });
  }
}

async function readJson(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > 32_000) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function artifactHtml(text) {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((paragraph, index) => (index === 0 ? `<h2>${escapeHtml(paragraph)}</h2>` : `<p>${escapeHtml(paragraph)}</p>`))
    .join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function contentType(path) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
  }[extname(path)] ?? "application/octet-stream";
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

async function assertCertificateFiles() {
  try {
    await Promise.all([stat(certificatePath), stat(keyPath)]);
  } catch {
    throw new Error("Missing trusted localhost certificate. Run: pnpm office:cert");
  }
}
