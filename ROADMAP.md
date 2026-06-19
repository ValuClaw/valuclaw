# Roadmap

ValuClaw's open core is early. This is **direction, not dates** — and everything in the repo uses synthetic data until a design partner names a real workflow. The build contract for an AI coding agent is in [`AGENTS.md`](AGENTS.md); running notes in [`PROGRESS.md`](PROGRESS.md).

## The shape we're building toward

A **thin, inspectable harness** for capital-markets work — think of a minimal coding agent, but for investment work product — with **no data, memory, or vendor lock-in** ([your harness, your memory](https://www.langchain.com/blog/your-harness-your-memory)). A user brings together:

1. **Their model + a thin harness.** A model of their choice (local or hosted) and a small harness with tool calls — data retrieval via vendor integrations, artifact editing, local filesystem, and web search.
2. **The context they choose.** Versioned skills, their own data (local machine or Microsoft storage), approved data-vendor integrations, and transparent long-term memory.
3. **Native Office.** Tweak or generate Word, Excel, and PowerPoint artifacts in place. **Office add-ins are the native surface** — ValuClaw lives where the work already is, not in a new portal.
4. **Preserved, searchable history** of every interaction.

## Done (v0)

- [x] [Specs](specs/): context manifest, skill spec, audit event, data-provider contract
- [x] A [JSON Schema](schemas/context-manifest.schema.json) for the context manifest
- [x] An [example skill](skills/weekly-update/SKILL.md) and a [synthetic end-to-end run](examples/weekly-update-run.md)

## v0.1 — Thin harness + tools (`core` + `cli`)

- [x] Skill loader (reads the skill spec / `SKILL.md`)
- [x] Context-manifest assembly, validated against the JSON schema
- [x] Provider-agnostic model adapter: deterministic **mock** + local (OpenAI-compatible / Ollama)
- [x] Inspectable tool registry: web search, local filesystem, data retrieval (data-provider contract), artifact ops
- [x] Append-only audit-event log
- [x] Human-approval gate before any send / save / external action
- [x] Transparent memory store: read / edit / export, kept separate from skills
- [x] `valuclaw run weekly-update --input <synthetic fixture>` → artifact + manifest + audit log
- [x] Blocks model commentary when the workbook is excluded (per the example run)
- [x] Unit + integration tests green

## v0.2 — Office document tools (`docs-engine`)

- [x] Read `.xlsx` into compact structure
- [x] Generate/edit `.docx` from templates (then `.xlsx`, `.pptx`)
- [x] Cell-level lineage carried into outputs
- [x] Round-trip tests on synthetic files

## v0.3 — Office add-in: the native surface (`office-addin`)

- [x] Office.js task-pane add-in + `manifest.xml` (one host first: Excel or Word)
- [x] Drives the harness: pick model / skill / context
- [x] Generate or edit the artifact in place
- [x] View history; approval gate and lineage visible in the pane
- [x] Sideloads in Office dev mode; weekly-update flow end-to-end on synthetic data

## v0.4 — Provider + history + second skill + evals

- [x] SEC/EDGAR public-filings provider implementing the data-provider contract (public data only)
- [x] Searchable run-history store
- [x] Second skill: model audit / workbook checks
- [x] Eval harness: citation coverage = 100%; blocks when the workbook is excluded

## Principles

- Synthetic data in the repo; never customer data or licensed vendor code.
- **Model-agnostic (local or hosted) and provider-agnostic; no lock-in.**
- Inspection-first: context manifests, audit events, and human approval from the first runnable version.
- Apache-2.0. Small and sharp beats broad and shallow.

## How this is funded

Everything in this repo is open-source (Apache-2.0) — there is **no proprietary or premium tier**. The business is **services on top of open code**: implementation (building it into your workflow), managed hosting (we run it for you), support, and training. You can always self-host and own the result.

→ [valuclaw.com](https://www.valuclaw.com)
