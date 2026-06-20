# ValuClaw

**Open-source AI associate for investment work — source-backed, Microsoft Office-native, and built so you are never locked in.**

> **Status:** Early. The specs and rails in this repo are the open core. We are building the product with a small group of design partners — this is not yet a finished application.

## Why this exists

Capital-markets teams already live in Excel, Outlook, Teams, SharePoint, Word, and PowerPoint, alongside licensed market data and internal systems. They do not need another portal. They need an associate that turns the access they already have into **source-backed, reviewable work product** — and that they can inspect, host, and own.

## Your harness, your memory — no lock-in

- **Model-agnostic** — route to the model your firm approves; swap without losing anything.
- **Your data** — runs on your Microsoft 365 and approved sources; nothing migrates into a new system of record.
- **Your memory** — long-term memory is transparent, editable, and portable, kept separate from skills.

An agent's harness and its memory are inseparable. Both should belong to the user, not a vendor. That is why the core is open.

## What's in here (the open rails)

This repo is the open, inspectable substrate. Apache-2.0.

- [`specs/context-manifest.md`](specs/context-manifest.md) — what enters a model call, and why.
- [`specs/skill-spec.md`](specs/skill-spec.md) — versioned, inspectable task procedures (skills), kept separate from memory.
- [`specs/audit-event.md`](specs/audit-event.md) — append-only record of tool calls, retrievals, model calls, approvals, and artifacts.
- [`specs/data-provider-contract.md`](specs/data-provider-contract.md) — entitlement-aware data access with source lineage.

Concrete examples and schemas:

- [`schemas/context-manifest.schema.json`](schemas/context-manifest.schema.json) — JSON Schema for the context manifest.
- [`skills/weekly-update/SKILL.md`](skills/weekly-update/SKILL.md) — an example versioned skill.
- [`examples/weekly-update-run.md`](examples/weekly-update-run.md) — a synthetic end-to-end run (manifest → tools → audit → output).

A reference harness and connector examples will land here as they stabilise — see [`ROADMAP.md`](ROADMAP.md) for direction.

## Try the v0.1 harness

Requires Node >=20 and pnpm.

```bash
pnpm install
pnpm build
pnpm test
pnpm valuclaw run weekly-update --input fixtures/weekly-update/input.json --out .valuclaw/runs/weekly-update
```

The synthetic run writes:

- `.valuclaw/runs/weekly-update/context-manifest.json`
- `.valuclaw/runs/weekly-update/artifact.md`
- `.valuclaw/runs/weekly-update/audit.ndjson`
- `.valuclaw/runs/weekly-update/memory-export.json`
- `.valuclaw/history.json`

To verify the inspection gate blocks model commentary when workbook context is excluded:

```bash
pnpm valuclaw run weekly-update --input fixtures/weekly-update/input.json --out .valuclaw/runs/blocked --exclude-workbook
```

## Office document tools

`packages/docs-engine` is the synthetic document layer:

- reads `.xlsx` into compact sheet/cell structures with lineage refs;
- writes `.docx` memo sections from templates with source lists;
- writes `.xlsx` review workbooks with a `ValuClaw_Lineage` sheet;
- writes `.pptx` summaries with lineage notes.

The package is intentionally fixture-driven until a design partner names a real workflow.

## Providers, history, and evals

- `packages/providers` includes a public-data SEC/EDGAR provider that implements the data-provider contract shape. Tests use a mocked fetcher; no live filings are committed.
- `packages/core` includes a JSON run-history store with append, search, and export.
- `skills/model-audit/SKILL.md` is the second example skill.
- `packages/evals` checks the synthetic weekly-update workflow for citation coverage and blocking when the workbook is excluded.

## Website demo payload

The public website demo is backed by a generated synthetic payload from this repo:

```bash
pnpm build
pnpm demo:payload
```

This writes `artifacts/demo/weekly-update-demo.json`, including workflow mapping, context and permission preview, policy checks, entitlement ledger, Office artifact preview, redlines, verification checks, approvals, and run history. It is synthetic-only and safe to copy into the website repo.

## Office add-in dev surface

`packages/office-addin` contains the first Word task-pane surface:

- `manifest.xml` for Office dev sideloading;
- `public/taskpane.html` and `src/taskpane.ts` for the task pane;
- synthetic controls for model, skill, and workbook context;
- visible approval state, lineage, and preserved run history;
- insertion into Word through `Office.context.document.setSelectedDataAsync` when Office.js is available.

Build it with:

```bash
pnpm --filter @valuclaw/office-addin build
```

Then serve `packages/office-addin/dist` at `https://localhost:3100` and sideload `packages/office-addin/manifest.xml` in Word dev mode. Runtime sideload verification requires a local Office desktop/web dev environment.

## For Microsoft 365 administrators and security teams

The point of open source is that you can read it: narrow delegated scopes, explicit context manifests, immutable audit events, human approval before consequential actions, and no training on your data. Apache-2.0 includes an explicit patent grant.

## Work with us

It's all open-source and free to run yourself. We make a living on **services** — implementing it: mapping one real workflow, building it with your team on these rails, and leaving you owning a source-backed Office workflow you can inspect, host, and keep. No proprietary tier.

→ [valuclaw.com](https://www.valuclaw.com)

## License

[Apache-2.0](LICENSE).
