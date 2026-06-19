# Roadmap

ValuClaw's open core is early. This is **direction, not dates** — and everything in the repo uses synthetic data until a design partner names a real workflow.

## The shape we're building toward

A **thin, inspectable harness** for capital-markets work — think of a minimal coding agent, but for investment work product — with **no data, memory, or vendor lock-in** ([your harness, your memory](https://www.langchain.com/blog/your-harness-your-memory)). A user brings together:

1. **Their model + a thin harness.** A model of their choice (local or hosted) and a small harness with tool calls — data retrieval via vendor integrations, artifact editing, local filesystem, and web search.
2. **The context they choose.** Versioned skills, their own data (local machine or Microsoft storage), approved data-vendor integrations, and transparent long-term memory.
3. **Native Office.** Tweak or generate Word, Excel, and PowerPoint artifacts in place. **Office add-ins are the native surface** — ValuClaw lives where the work already is, not in a new portal.
4. **Preserved, searchable history** of every interaction.

## Done (v0)

- [Specs](specs/): context manifest, skill spec, audit event, data-provider contract.
- A [JSON Schema](schemas/context-manifest.schema.json) for the context manifest.
- An [example skill](skills/weekly-update/SKILL.md) and a [synthetic end-to-end run](examples/weekly-update-run.md).

## Next

- **Thin harness + tools (v0.1).** Load a skill, assemble a context manifest, call a model through a **provider-agnostic adapter (local or hosted)**, run tool calls (web search, local filesystem, data retrieval via the data-provider contract, artifact ops), emit audit events, enforce a human-approval gate, and keep transparent memory separate from skills. Runnable headless (CLI + library).
- **Office document tools (v0.2).** Read an Excel workbook into compact structure and write/edit Word, Excel, and PowerPoint — with cell-level lineage.
- **Office add-in — the native surface (v0.3).** A task-pane add-in (one app first) that drives the harness from inside Office: pick model / skill / context, generate or edit the artifact in place, and see history. This is how users actually meet ValuClaw.
- **First data provider + history (v0.4).** A public-filings (SEC/EDGAR) provider implementing the data-provider contract, a searchable run-history store, and a second skill with a small eval harness.

## Principles

- Synthetic data in the repo; never customer data or licensed vendor code.
- **Model-agnostic (local or hosted) and provider-agnostic; no lock-in.**
- Inspection-first: context manifests, audit events, and human approval from the first runnable version.
- Apache-2.0. Small and sharp beats broad and shallow.

## What stays commercial

The production, admin-deployable Microsoft 365 add-in; managed hosting; premium firm-specific skills and connectors; support; and security/compliance packaging. The open core is the substrate; the business is building it into your workflow and running it.

→ [valuclaw.com](https://www.valuclaw.com)
