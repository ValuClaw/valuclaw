# Progress

A running log for the build loop. Keep it short and current. See [`AGENTS.md`](AGENTS.md) for the build contract and [`ROADMAP.md`](ROADMAP.md) for the checklist.

## Current milestone

Roadmap complete through v0.4.

## Done

- v0 — specs, JSON schema, example skill, synthetic run.
- v0.1 — thin TypeScript harness + CLI:
  - skill loader;
  - context manifest assembly + schema validation;
  - provider-agnostic model adapter with deterministic mock and local OpenAI-compatible adapter;
  - inspectable tool registry;
  - append-only audit log;
  - approval gate event before external send/shared save;
  - transparent memory store;
  - synthetic weekly-update fixture and CLI output: artifact, manifest, audit log, memory export;
  - blocked model commentary when workbook context is excluded;
  - unit/integration tests.
- v0.2 — Office document tools:
  - `packages/docs-engine` reads synthetic `.xlsx` workbooks into compact cell structures with lineage;
  - generates `.docx` from string templates with source lineage;
  - writes `.xlsx` outputs with a `ValuClaw_Lineage` sheet;
  - writes `.pptx` summaries with lineage notes;
  - round-trip tests on synthetic files.
- v0.3 — Office add-in native surface:
  - Word task-pane `manifest.xml`;
  - static Office.js task pane with model / skill / workbook context controls;
  - synthetic weekly-update generation;
  - Word insertion path via `Office.context.document.setSelectedDataAsync`;
  - visible lineage, approval state, and preserved history;
  - build copies task-pane assets into `dist`.
- v0.4 — provider + history + second skill + evals:
  - `packages/providers` SEC/EDGAR public-filings provider with data-provider declaration and mocked retrieval tests;
  - searchable JSON run-history store in `core`;
  - `skills/model-audit/SKILL.md` example skill;
  - `packages/evals` weekly-update eval harness for citation coverage and excluded-workbook blocking.

## Next

- Keep hardening the open core with real design-partner workflows, but do not add real customer data or licensed vendor data.
- Human-verify the Office add-in sideload flow in Word dev mode.

## Decisions / notes

- Used pnpm workspaces with `packages/core` and `packages/cli`.
- Kept v0.1 document/artifact output as local draft files; no external send/shared save is performed. The approval gate is recorded as pending before any consequential external action.
- The local model adapter targets OpenAI-compatible `/chat/completions`; tests use deterministic mock only.
- Tool registry includes inspectable v0.1 tools; web search is a synthetic placeholder until a public/permitted provider is added.
- Added `packages/docs-engine` with `xlsx`, `docx`, `pptxgenjs`, and `jszip`; tests inspect generated Office package XML rather than using real customer files.
- The add-in is a dev/synthetic sideload surface. Runtime verification inside Word requires a human Office desktop/web dev environment; no Microsoft credentials are committed or required.
- EDGAR provider tests use a mocked fetcher. The package is public-data only and does not fetch or commit live filings in tests.

## Blocked / needs a human

- Runtime Office sideload verification requires a local Office desktop/web dev environment.
