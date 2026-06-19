#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { runWeeklyUpdate } from "@valuclaw/core";

interface Args {
  input?: string;
  out?: string;
  history?: string;
  excludeWorkbook: boolean;
}

async function main() {
  const [command, workflow, ...rest] = process.argv.slice(2);
  if (command !== "run" || workflow !== "weekly-update") {
    usage();
    process.exit(command === "--help" || command === "-h" ? 0 : 1);
  }
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
      ""
    ].join("\n")
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
