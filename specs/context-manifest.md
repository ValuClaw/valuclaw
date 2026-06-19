# Context Manifest

A context manifest records exactly what entered a meaningful model call, so any output can be inspected, reproduced, and trusted. Memory is just a form of context — it appears here explicitly, never as a hidden second prompt.

Every important model call SHOULD emit a manifest with:

| Field | Meaning |
|---|---|
| `skill` | selected skill id and version |
| `memory` | persistent memory snippets included (ids + scope) |
| `sources` | retrieved source refs (id, provider, as-of, citation label) |
| `workflow_state` | task progress / blockers included |
| `policy` | policy constraints applied (data class, model allowlist) |
| `tools` | tool schemas exposed to the model |
| `model` | model selected and routing reason |
| `data_classes` | classes of data sent to the model |
| `excluded` | context deliberately excluded, when exclusion is material |

Manifests are inspectable by the user and the administrator. A professional should never have to trust a hidden harness interpretation of their preferences or project context.

_A machine-readable JSON Schema will accompany this spec._
