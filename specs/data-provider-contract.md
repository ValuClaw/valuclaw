# Data Provider Contract

Every data source — a vendor API, a warehouse view, an uploaded file, or a SharePoint folder — enters through one governed contract. ValuClaw consumes the customer's **approved** data layer; it does not resell data or assume redistribution rights.

Each provider declares:

| Field | Meaning |
|---|---|
| `owner`, `data_class`, `sensitivity` | who owns it and how sensitive it is |
| `auth_mode`, `entitlement_behavior` | how access is authenticated and scoped to user rights |
| `supported_entities`, `parameters`, `time_ranges` | what can be requested |
| `as_of_logic`, `citation_format` | timestamping and how sources are labelled |
| `allowed_use_cases`, `allowed_model_classes` | where the data may be used and which models may see it |
| `redistribution`, `caching`, `retention` | data-rights restrictions |
| `audit_fields`, `stale_data_behavior` | what is logged, and failure behaviour |

Each retrieval logs: identity, tenant, workflow + skill version, purpose, source queried, parameters, returned artifact ids, source as-of time, downstream model or deliverable, and approval state.

This is the boundary that lets ValuClaw be composable without becoming an uncontrolled data broker.
