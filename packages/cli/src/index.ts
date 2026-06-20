#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { readWeeklyUpdateInput, runWeeklyUpdate, weeklyUpdateDemoPayload } from "@valuclaw/core";

const execFileAsync = promisify(execFile);

interface Args {
  input?: string;
  out?: string;
  history?: string;
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
  await mkdir(outDir, { recursive: true });
  const result = await runWeeklyUpdate({
    inputPath: resolve(args.input),
    outDir,
    historyPath,
    excludeWorkbook: args.excludeWorkbook
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
  const parsed: Args = { excludeWorkbook: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") {
      parsed.input = args[++i];
    } else if (arg === "--out") {
      parsed.out = args[++i];
    } else if (arg === "--history") {
      parsed.history = args[++i];
    } else if (arg === "--exclude-workbook") {
      parsed.excludeWorkbook = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function usage() {
  process.stdout.write(
    [
      "Usage:",
      "  valuclaw run weekly-update --input <synthetic fixture> [--out <dir>] [--history <file>] [--exclude-workbook]",
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
