# AGENTS.md

Instructions for an AI coding agent building this repo (e.g. running in a loop). Humans: this is also the build contract.

## Mission

You are building the open core of **ValuClaw** — a thin, inspectable AI harness for capital-markets work product (think a minimal coding agent, but for investment work), with **no data, memory, or vendor lock-in**. This repo is Apache-2.0. Build it milestone by milestone per [`ROADMAP.md`](ROADMAP.md), test-first, until the roadmap is complete.

## First, read the contract (do not skip)

Read and treat as source of truth: `README.md`, `ROADMAP.md`, all of `specs/` (`context-manifest.md`, `skill-spec.md`, `audit-event.md`, `data-provider-contract.md`), `schemas/context-manifest.schema.json`, `skills/weekly-update/SKILL.md`, and `examples/weekly-update-run.md`. The specs define behavior — implement to them. If a spec must change, change it deliberately and say why in the commit.

## The shape (4 pillars)

A user brings together: (1) their model of choice (local or hosted) + a thin harness with tool calls — data retrieval (via the data-provider contract), artifact editing, local filesystem, web search; (2) the context they choose — versioned skills + their own data (local or Microsoft storage) + approved data-vendor integrations + transparent long-term memory; (3) native Word/Excel/PowerPoint editing/generation — **Office add-ins are the native surface**; (4) preserved, searchable history. Memory and skills stay separate. Everything is inspectable.

## Tech (use unless you have a strong reason not to)

TypeScript, Node ≥20, pnpm monorepo, vitest. Packages: `core` (harness, manifest, memory, audit, approval, provider adapters, tool registry), `cli`, `docs-engine` (Office document tools), `providers` (model + data), `skills`, `office-addin` (Office.js task pane). One language shared with the add-in. Model access via a **provider-agnostic adapter** with at least a local (OpenAI-compatible / Ollama) provider and a deterministic **mock** provider for tests. Secrets via env only.

## Build order & definition of done

See [`ROADMAP.md`](ROADMAP.md) for the per-milestone checklist and exit criteria (v0.1 thin harness + tools → v0.2 Office document tools → v0.3 Office add-in → v0.4 provider + history + 2nd skill + evals). A milestone is done only when its checkboxes are checked and its stated tests pass.

## Non-negotiables (never violate)

- **Synthetic data only** in the repo. Never use, fetch, or commit real customer data or **licensed** vendor data/code. EDGAR (public) is allowed; Bloomberg/FactSet/CapIQ/etc. are not.
- **Model- and provider-agnostic; no lock-in.** Never hardcode one model/provider. Memory and history are transparent, editable, and exportable. Memory is separate from skills.
- **Inspection-first.** Every model call emits a context manifest; every consequential step emits an audit event; a human approval gate precedes any send / save / file overwrite / external action — from the first runnable version.
- **Everything is open-source (Apache-2.0).** There is no proprietary or premium tier — do not add closed components. The business model is services (implementation, managed hosting, support), not closed code. Build the Office add-in for real (not a throwaway), as far as synthetic data and dev sideloading allow.
- No secrets committed. Apache-2.0 headers where appropriate. No fake customers, metrics, or vendor partnerships.

## Loop protocol

1. Read `ROADMAP.md`; pick the next unchecked sub-task.
2. Write/adjust tests first.
3. Implement.
4. Run lint + tests; iterate until green.
5. Commit small, with conventional messages.
6. Update the `ROADMAP.md` checkbox and `PROGRESS.md` (done / next / decisions).
7. Repeat until the roadmap is complete.

## Stop and ask a human when

you need real Microsoft tenant / Graph credentials, any licensed vendor access, a production Office Store submission, or a decision that changes a spec's intent or the scope in `ROADMAP.md`. Do **not** fake or stub these as if real — leave a clearly-marked synthetic/dev path and flag it in `PROGRESS.md`.

## Definition of done (overall)

All `ROADMAP.md` milestones checked, tests green, the weekly-update workflow runs end-to-end from the Office add-in on synthetic data with visible manifest / audit / approval / lineage and searchable history, and `README.md` / `ROADMAP.md` / `specs/` are consistent with the code.
