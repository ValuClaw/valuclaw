# Skill Spec

A skill is an explicit, versioned operating procedure — how the associate performs a task. Skills are kept **separate from memory**: skills describe how to do the work; memory describes the user, project, and firm.

A skill declares:

| Field | Meaning |
|---|---|
| `id`, `version`, `owner`, `changelog` | identity and provenance |
| `purpose` | what the skill produces |
| `triggers` | when it should run |
| `inputs` | required context and source policy |
| `procedure` | retrieval strategy, calculation conventions, required checks |
| `output_contract` | artifact shape (e.g. Word section, Excel review tab) + citation rules |
| `approval` | what requires human approval before send / save |
| `evals` | benchmark tasks and expected outputs |

Skills are inspectable before use, tenant- or team-scoped where appropriate, testable against benchmarks, composable into workflows, and governed by admin policy. The goal is to avoid hidden prompt sprawl: a professional or admin can see which skill ran, at which version, and what it added to the model context.
