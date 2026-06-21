#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { OpenAICompatibleProvider, readWeeklyUpdateInput, runWeeklyUpdate, weeklyUpdateDemoPayload } from "@valuclaw/core";

const execFileAsync = promisify(execFile);

interface Args {
  input?: string;
  out?: string;
  history?: string;
  provider?: "mock" | "openai-compatible";
  baseUrl?: string;
  model?: string;
  apiKeyEnv?: string;
  maxTokens?: number;
  excludeWorkbook: boolean;
}

async function main() {
  const [command, workflow, ...rest] = process.argv.slice(2);
  if (command === "run" && workflow === "weekly-update") {
    await runWeeklyUpdateCommand(rest);
    return;
  }
  if (command === "demo" && workflow === "weekly-update") {
    await writeWeeklyUpdateDemoCommand(rest);
    return;
  }
  if (command === "--help" || command === "-h") {
    usage();
    return;
  }
  usage();
  process.exit(1);
}

async function runWeeklyUpdateCommand(rest: string[]) {
  const args = parseArgs(rest);
  if (!args.input) {
    throw new Error("Missing --input <synthetic fixture>");
  }
  const outDir = resolve(args.out ?? ".valuclaw/runs/weekly-update");
  const historyPath = resolve(args.history ?? ".valuclaw/history.json");
  const local = localProviderFromArgs(args);
  await mkdir(outDir, { recursive: true });
  const result = await runWeeklyUpdate({
    inputPath: resolve(args.input),
    outDir,
    historyPath,
    excludeWorkbook: args.excludeWorkbook,
    ...local
  });
  process.stdout.write(
    [
      `ValuClaw weekly-update run complete`,
      `artifact: ${outDir}/artifact.md`,
      `manifest: ${outDir}/context-manifest.json`,
      `audit: ${outDir}/audit.ndjson`,
      `history: ${historyPath}`,
      `blocked: ${result.artifact.blocked ? "yes" : "no"}`,
      ""
    ].join("\n")
  );
}

async function writeWeeklyUpdateDemoCommand(rest: string[]) {
  const args = parseArgs(rest);
  if (!args.input) {
    throw new Error("Missing --input <synthetic fixture>");
  }
  const outPath = resolve(args.out ?? "artifacts/demo/weekly-update-demo.json");
  await mkdir(resolve(outPath, ".."), { recursive: true });
  const inputPath = resolve(args.input);
  const [input, result, openCoreCommit] = await Promise.all([
    readWeeklyUpdateInput(inputPath),
    runWeeklyUpdate({ inputPath, excludeWorkbook: args.excludeWorkbook }),
    currentGitCommit()
  ]);
  const payload = weeklyUpdateDemoPayload({
    input,
    result,
    fixtureId: args.input,
    openCoreCommit
  });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`Wrote weekly-update demo payload: ${outPath}\n`);
}

function parseArgs(args: string[]): Args {
  const parsed: Args = { excludeWorkbook: false, provider: "mock" };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") {
      parsed.input = args[++i];
    } else if (arg === "--out") {
      parsed.out = args[++i];
    } else if (arg === "--history") {
      parsed.history = args[++i];
    } else if (arg === "--provider") {
      const provider = args[++i];
      if (provider !== "mock" && provider !== "openai-compatible") {
        throw new Error("--provider must be mock or openai-compatible");
      }
      parsed.provider = provider;
    } else if (arg === "--base-url") {
      parsed.baseUrl = args[++i];
    } else if (arg === "--model") {
      parsed.model = args[++i];
    } else if (arg === "--api-key-env") {
      parsed.apiKeyEnv = args[++i];
    } else if (arg === "--max-tokens") {
      parsed.maxTokens = parsePositiveInteger(args[++i], "--max-tokens");
    } else if (arg === "--exclude-workbook") {
      parsed.excludeWorkbook = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function localProviderFromArgs(args: Args) {
  if (args.provider !== "openai-compatible") {
    return {};
  }
  const model = args.model ?? process.env.VALUCLAW_MODEL;
  if (!model) {
    throw new Error("--model <id> or VALUCLAW_MODEL is required for --provider openai-compatible");
  }
  const baseUrl = args.baseUrl ?? process.env.VALUCLAW_MODEL_BASE_URL ?? "http://127.0.0.1:11434/v1";
  const apiKeyEnv = args.apiKeyEnv ?? "VALUCLAW_MODEL_API_KEY";
  const maxTokens = args.maxTokens ?? environmentPositiveInteger("VALUCLAW_MODEL_MAX_TOKENS");
  return {
    provider: new OpenAICompatibleProvider({
      baseUrl,
      model,
      apiKey: process.env[apiKeyEnv],
      maxTokens
    }),
    model: {
      id: model,
      routing_reason: "Customer-selected OpenAI-compatible model endpoint.",
      deployment: "local" as const
    }
  };
}

function parsePositiveInteger(value: string | undefined, option: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function environmentPositiveInteger(name: string): number | undefined {
  const value = process.env[name];
  return value ? parsePositiveInteger(value, name) : undefined;
}

function usage() {
  process.stdout.write(
    [
      "Usage:",
      "  valuclaw run weekly-update --input <synthetic fixture> [--out <dir>] [--history <file>] [--exclude-workbook]",
      "    [--provider mock|openai-compatible] [--base-url <url>] [--model <id>] [--api-key-env <environment variable>] [--max-tokens <n>]",
      "  valuclaw demo weekly-update --input <synthetic fixture> [--out <file>] [--exclude-workbook]",
      ""
    ].join("\n")
  );
}

async function currentGitCommit(): Promise<string> {
  try {
    const [{ stdout }, { stdout: status }] = await Promise.all([
      execFileAsync("git", ["rev-parse", "--short", "HEAD"]),
      execFileAsync("git", ["status", "--porcelain"])
    ]);
    const commit = stdout.trim() || "unknown";
    return status.trim() ? `${commit}-dirty` : commit;
  } catch {
    return "unknown";
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
