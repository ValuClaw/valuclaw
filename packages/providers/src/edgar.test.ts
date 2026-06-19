import { describe, expect, it } from "vitest";
import { EdgarProvider } from "./edgar.js";

describe("EDGAR provider", () => {
  it("declares a public data-provider contract and retrieves public source refs", async () => {
    const provider = new EdgarProvider({
      asOf: "2026-06-20T00:00:00Z",
      fetcher: async (url) =>
        new Response(JSON.stringify({ url, entityName: "SyntheticCo" }), {
          headers: { "content-type": "application/json" }
        })
    });
    expect(provider.declaration.data_class).toBe("public-filing");
    expect(provider.declaration.auth_mode).toBe("none-public");
    const result = await provider.companyFacts("320193");
    expect(result.source.provider).toBe("sec-edgar");
    expect(result.source.id).toBe("sec:companyfacts:CIK0000320193");
    expect(JSON.stringify(result.data)).toContain("SyntheticCo");
  });
});
