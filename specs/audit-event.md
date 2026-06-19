# Audit Event

An append-only event written for every consequential step, so a professional, manager, compliance reviewer, or administrator can reconstruct what happened.

Each event records:

| Field | Meaning |
|---|---|
| `id`, `ts` | event id and timestamp |
| `actor`, `tenant` | identity (user or service) and tenant |
| `type` | `tool_call` \| `retrieval` \| `model_call` \| `approval` \| `artifact` \| `external_action` |
| `purpose` | why this happened |
| `inputs` / `params` | what was passed |
| `sources` | source refs + as-of times |
| `model` | model that saw the data (for `model_call`) |
| `result` | returned artifact ids |
| `approval` | required? by whom? when? |

Audit events are immutable and exportable (e.g. to a SIEM). They can inform review and compliance, but they are **not** automatically injected into future model calls.
