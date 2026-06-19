# Skill: Model Audit

```yaml
id: skill.model_audit
version: 0.1.0
owner: valuclaw
status: example (synthetic)
```

An example skill for workbook checks and model commentary review. It follows [`specs/skill-spec.md`](../../specs/skill-spec.md) and uses synthetic data only.

## Purpose
Inspect a selected workbook for changed assumptions, hardcodes, broken links, formula issues, and unexplained output movements before a model moves into a memo or deck.

## Triggers
- Manual: the user asks for "audit this model" or "what changed in the model".
- Workflow: before generating a memo, IC page, or weekly update from workbook commentary.

## Inputs
- `workbook` — current workbook.
- `prior_workbook` — optional prior version.
- `source_packet` — approved source refs used to tie material claims.
- `memory` — approved model-review preferences, separate from the skill.

## Source policy
- Every flagged figure or assumption MUST include a workbook cell, sheet name, and as-of timestamp.
- If the workbook is excluded, block model commentary and request workbook context.
- Do not infer source lineage from labels alone.

## Procedure
1. Assemble the context manifest.
2. Read workbook sheets into compact structure.
3. Identify changed assumptions, hardcodes, broken links, and material output movements.
4. Produce a review tab or memo section with flags and source refs.

## Output contract
- Excel review tab with issue list and source refs.
- Word-ready model-audit summary.
- Review flags grouped by severity.

## Approval
- Human approval required before saving over a workbook, sharing a memo, or sending a follow-up.

## Evals
- Blocks when workbook context is excluded.
- Citation coverage: 100% of flagged items include workbook lineage.
- No customer or licensed vendor data in fixtures.
