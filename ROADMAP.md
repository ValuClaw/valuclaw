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

- [ ] Skill loader (reads the skill spec / `SKILL.md`)
- [ ] Context-manifest assembly, validated against the JSON schema
- [ ] Provider-agnostic model adapter: deterministic **mock** + local (OpenAI-compatible / Ollama)
- [ ] Inspectable tool registry: web search, local filesystem, data retrieval (data-provider contract), artifact ops
- [ ] Append-only audit-event log
- [ ] Human-approval gate before any send / save / external action
- [ ] Transparent memory store: read / edit / export, kept separate from skills
- [ ] `valuclaw run weekly-update --input <synthetic fixture>` → artifact + manifest + audit log
- [ ] Blocks model commentary when the workbook is excluded (per the example run)
- [ ] Unit + integration tests green

## v0.2 — Office document tools (`docs-engine`)

- [ ] Read `.xlsx` into compact structure
- [ ] Generate/edit `.docx` from templates (then `.xlsx`, `.pptx`)
- [ ] Cell-level lineage carried into outputs
- [ ] Round-trip tests on synthetic files

## v0.3 — Office add-in: the native surface (`office-addin`)

- [ ] Office.js task-pane add-in + `manifest.xml` (one host first: Excel or Word)
- [ ] Drives the harness: pick model / skill / context
- [ ] Generate or edit the artifact in place
- [ ] View history; approval gate and lineage visible in the pane
- [ ] Sideloads in Office dev mode; weekly-update flow end-to-end on synthetic data

## v0.4 — Provider + history + second skill + evals

- [ ] SEC/EDGAR public-filings provider implementing the data-provider contract (public data only)
- [ ] Searchable run-history store
- [ ] Second skill: model audit / workbook checks
- [ ] Eval harness: citation coverage = 100%; blocks when the workbook is excluded

## Principles

- Synthetic data in the repo; never customer data or licensed vendor code.
- **Model-agnostic (local or hosted) and provider-agnostic; no lock-in.**
- Inspection-first: context manifests, audit events, and human approval from the first runnable version.
- Apache-2.0. Small and sharp beats broad and shallow.

## How this is funded

Everything in this repo is open-source (Apache-2.0) — there is **no proprietary or premium tier**. The business is **services on top of open code**: implementation (building it into your workflow), managed hosting (we run it for you), support, and training. You can always self-host and own the result.

→ [valuclaw.com](https://www.valuclaw.com)
