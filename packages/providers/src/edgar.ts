import type { SourceRef } from "@valuclaw/core";

export interface DataProviderDeclaration {
  owner: string;
  data_class: string;
  sensitivity: string;
  auth_mode: string;
  entitlement_behavior: string;
  supported_entities: string[];
  allowed_use_cases: string[];
  allowed_model_classes: string[];
  redistribution: string;
  caching: string;
  retention: string;
  citation_format: string;
}

export interface EdgarRetrieval {
  source: SourceRef;
  data: unknown;
}

export class EdgarProvider {
  readonly declaration: DataProviderDeclaration = {
    owner: "sec",
    data_class: "public-filing",
    sensitivity: "public",
    auth_mode: "none-public",
    entitlement_behavior: "public-edgar-access-only",
    supported_entities: ["cik"],
    allowed_use_cases: ["source-backed-public-filing-context"],
    allowed_model_classes: ["frontier", "private", "fast", "local", "mock"],
    redistribution: "public-source-citation-required",
    caching: "allowed-with-source-url-and-as-of",
    retention: "allowed-for-synthetic-tests-and-customer-approved-workflows",
    citation_format: "SEC EDGAR - CIK {cik} - companyfacts"
  };

  constructor(
    private readonly options: {
      fetcher?: typeof fetch;
      asOf?: string;
    } = {}
  ) {}

  async companyFacts(cik: string): Promise<EdgarRetrieval> {
    const normalized = cik.padStart(10, "0");
    const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${normalized}.json`;
    const fetcher = this.options.fetcher;
    const data = fetcher ? await (await fetcher(url, { headers: { "user-agent": "ValuClaw synthetic dev contact@valuclaw.com" } })).json() : { cik: normalized };
    return {
      source: {
        id: `sec:companyfacts:CIK${normalized}`,
        provider: "sec-edgar",
        as_of: this.options.asOf ?? new Date().toISOString(),
        citation: `SEC EDGAR - CIK ${normalized} - companyfacts`
      },
      data
    };
  }
}
