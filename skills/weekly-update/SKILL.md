# Skill: Weekly Investment Update

```yaml
id: skill.weekly_update
version: 0.1.0
owner: valuclaw
status: example (synthetic)
```

An example skill that follows [`specs/skill-spec.md`](../../specs/skill-spec.md). It is illustrative — it uses synthetic data and is here to show the shape of a real, versioned skill, not to ship as-is.

## Purpose
Draft a concise weekly update from selected Office context, approved source refs, and approved memory.

## Triggers
- Manual: the user asks for "the weekly update".
- Scheduled: an opt-in recurring weekly job.

## Inputs
- `workbook` — the current model (marks / NAV / drivers).
- `prior_update` — last week's update.
- `notes` — position or research notes.
- `market_data` — approved as-of quotes via the [data-provider contract](../../specs/data-provider-contract.md).
- `memory` — approved long-term memory scoped to weekly updates.

## Source policy
- Every material claim MUST carry a source ref (cell, file+page, or provider+as-of).
- Do **not** state numbers that cannot be traced. If the workbook is excluded, block model commentary and ask the user to include it.
- Never use management-adjusted figures unless the adjustment bridge is in the source packet.

## Procedure
1. Assemble the [context manifest](../../specs/context-manifest.md); record what is included and excluded.
2. If enabled, run the workbook-check tool: changed assumptions, hardcodes, broken links, variances.
3. Draft the update; attach a source ref to each figure and claim.
4. List open review items at the end.

## Output contract
- A Word-ready update section with inline citations.
- An Outlook-ready draft addressed to the reviewer.
- A source list (every ref, with as-of times).
- Review flags (assumption changes, unresolved checks).

## Approval
- Human approval **required** before any send (Outlook) or save to a shared location.

## Evals
- Citation coverage: 100% of figures carry a traceable ref.
- When the workbook is excluded, the skill blocks commentary and does not fabricate numbers.
- Reviewer-accepted without rework on the synthetic fixture.
