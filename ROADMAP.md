# Roadmap

ValuClaw's open core is early. This is **direction, not dates** — and everything in the repo uses synthetic data until a design partner names a real workflow.

## Done (v0)

- Specs: [context manifest](specs/context-manifest.md), [skill spec](specs/skill-spec.md), [audit event](specs/audit-event.md), [data-provider contract](specs/data-provider-contract.md).
- A [JSON Schema](schemas/context-manifest.schema.json) for the context manifest.
- An [example versioned skill](skills/weekly-update/SKILL.md) (weekly update) and a [synthetic end-to-end run](examples/weekly-update-run.md).

## Next

- **Reference harness (v0.1).** A minimal, runnable harness: load a skill, assemble a context manifest, call a model through a provider-agnostic adapter, emit audit events, and enforce a human-approval gate. A CLI that runs the weekly-update skill on synthetic data and writes an artifact. This turns the specs into something you can run.
- **Office document layer (v0.2).** Read an Excel workbook into compact structure and write a Word section — so a figure in the draft links back to its cell. One path first (Excel → Word), synthetic files.
- **First data provider (v0.3).** A public-filings (SEC/EDGAR) provider implementing the data-provider contract, with source lineage. Public data only.
- **A second skill + evals (v0.4).** A model-audit skill (workbook checks) and a small eval harness (citation coverage; must block when the workbook is excluded).

## Principles

- Synthetic data in the repo; never customer data or licensed vendor code.
- Provider-agnostic; no hard dependency on any one model or data vendor.
- Inspection-first: context manifests, audit events, and human approval are present from the first runnable version.
- Apache-2.0. Small and sharp beats broad and shallow.

## What stays commercial

Implementation / consulting, managed hosting, premium firm-specific skills and connectors, the Microsoft 365 production add-in, support, and security/compliance packaging. The open core is the substrate; the business is building it into your workflow and running it.

→ [valuclaw.com](https://www.valuclaw.com)
