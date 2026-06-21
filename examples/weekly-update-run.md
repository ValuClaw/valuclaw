# Example run — Weekly Investment Update (synthetic)

Illustrative only. No real data. This shows how the rails fit together for one run of [`skills/weekly-update`](../skills/weekly-update/SKILL.md).

## Setup
- Skill: `skill.weekly_update@0.1.0`
- Model: approved frontier
- Tools: workbook check (on), source search (off)
- Context included: `Model_v12.xlsx` (workbook), an approved market-data quote, weekly-update memory.
- Output target: Word section.

## Context manifest (excerpt)

```json
{
  "model": { "id": "frontier", "routing_reason": "judgment-heavy synthesis", "deployment": "frontier" },
  "skill": { "id": "skill.weekly_update", "version": "0.1.0" },
  "memory": [{ "id": "mem.weekly_style", "scope": "weekly-update" }],
  "sources": [
    { "id": "wb:Model_v12.xlsx#Revenue Build!F87", "provider": "workbook", "as_of": "2026-06-19T08:14:00Z", "citation": "Revenue Build · cell F87" },
    { "id": "wb:Model_v12.xlsx#Debt Schedule!D40", "provider": "workbook", "as_of": "2026-06-19T08:14:00Z", "citation": "Debt Schedule · cell D40" },
    { "id": "wb:Model_v12.xlsx#Assumptions!C19", "provider": "workbook", "as_of": "2026-06-19T08:14:00Z", "citation": "Assumptions · cell C19" }
  ],
  "tools": ["workbook_check"],
  "data_classes": ["internal-model", "approved-market-data"],
  "excluded": []
}
```

## Audit events (excerpt)

```text
retrieval    workbook Model_v12.xlsx (Revenue Build, Assumptions, Debt Schedule)
tool_call    workbook_check -> 1 changed assumption (churn 3.2% -> 4.0%), 0 broken links
model_call   frontier saw the manifest above
artifact     Word update section + source list
approval     REQUIRED before Outlook send (pending)
```

## Output (excerpt)

> Topline reached **$48.2M** in FY24 (_Revenue Build · F87_), up **21% YoY**, while net leverage held at **3.1x** (_Debt Schedule · D40_). The base case assumes **4.0% churn** (_Assumptions · C19_) — changed from 3.2% last week; flagged for review.
>
> **Open items:** confirm the churn assumption change with the deal team.

Note: had the workbook been excluded, the skill would have **blocked** the model commentary and asked the user to include it, rather than state numbers it could not trace.
