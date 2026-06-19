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

## Next primitives — not yet done

These are direction, not dates. They should be pulled only when they strengthen the public demo or a design-partner workflow.

## v0.5 — Demo-grade workflow surface

- [ ] Export the synthetic weekly-update run as a browser-demo state machine
- [ ] Show model choice, skill version, selected context, approved data, memory, output, sources, approvals, and history
- [ ] Keep all data synthetic/public and avoid live customer/vendor access
- [ ] Make the demo useful to a skeptical capital-markets professional, not just a developer inspecting architecture

## v0.6 — Microsoft identity + surface bridge

- [ ] Document Microsoft Entra app registration and narrow delegated-scope ladder
- [ ] Add a local Microsoft Graph adapter interface with mocked tests only
- [ ] Add Office/Outlook/Teams/email/CLI command envelopes that dispatch into the same headless core
- [ ] Record every Microsoft read and pending write/send/save as audit events
- [ ] Provide an admin packet: permission matrix, data-flow sketch, deployment notes, audit examples

## v0.7 — Data readiness

- [ ] Harden the data-provider contract as runtime validation, not only docs
- [ ] Add OpenBB-compatible response normalization into source refs and audit events
- [ ] Add local REST / MCP provider adapter shape for customer-approved data services
- [ ] Require entitlement, allowed-use, caching, retention, redistribution, as-of, and citation metadata
- [ ] Keep tests on synthetic/public data; do not commit licensed vendor data or credentials

## v0.8 — Memory + skills governance

- [ ] Add memory candidate review: approve / reject / edit before persistence
- [ ] Add memory scopes by user, team, workflow, and project
- [ ] Add export/delete/update APIs and tests proving excluded memory is excluded
- [ ] Add skill version pinning, migration notes, and compatibility checks

## v0.9 — Office artifact hardening

- [ ] Expand typed document commands across Word, Excel, and PowerPoint
- [ ] Add diff/revert flows for generated edits
- [ ] Validate formulas, citations, links, and source lineage before artifact approval
- [ ] Bind outputs to synthetic templates that mimic firm-style artifacts without using real customer templates

## v1.0 candidate — First design-partner wedge

- [ ] Choose segment x artifact x surface x data path from discovery
- [ ] Build the narrowest real workflow with customer-approved data and permissions
- [ ] Generalize the reusable skill / connector / document command back into the open source
- [ ] Keep customer data, credentials, and licensed vendor material out of the repo

## Principles

- Synthetic data in the repo; never customer data or licensed vendor code.
- **Model-agnostic (local or hosted) and provider-agnostic; no lock-in.**
- Inspection-first: context manifests, audit events, and human approval from the first runnable version.
- Apache-2.0. Small and sharp beats broad and shallow.

## How this is funded

Everything in this repo is open-source (Apache-2.0) — there is **no proprietary or premium tier**. The business is **services on top of open code**: implementation (building it into your workflow), managed hosting (we run it for you), support, and training. You can always self-host and own the result.

→ [valuclaw.com](https://www.valuclaw.com)
