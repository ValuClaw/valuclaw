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

A reference harness, example skills, and connector examples will land here as they stabilise.

## For Microsoft 365 administrators and security teams

The point of an open core is that you can read it: narrow delegated scopes, explicit context manifests, immutable audit events, human approval before consequential actions, and no training on your data. Apache-2.0 includes an explicit patent grant.

## Work with us

The open core is free. We make a living implementing it — mapping one real workflow, building it with your team on these rails, and leaving you owning a source-backed Office workflow you can inspect and host.

→ [valuclaw.com](https://www.valuclaw.com)

## License

[Apache-2.0](LICENSE).
