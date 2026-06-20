import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalOpenAICompatibleProvider } from "./model-adapter.js";
import type { ContextManifest, WeeklyUpdateInput } from "./types.js";

const manifest: ContextManifest = {
  model: { id: "qwen3.5:4b", routing_reason: "local proof", deployment: "local" },
  skill: { id: "skill.weekly_update", version: "0.1.0" },
  data_classes: ["synthetic"]
};

const input = {
  actor: "user.synthetic",
  tenant: "tenant.synthetic",
  skillPath: "skills/weekly-update/SKILL.md",
  includeWorkbook: true,
  outputTarget: "word-section",
  model: manifest.model
} satisfies WeeklyUpdateInput;

describe("OpenAI-compatible local model adapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("caps local-model output unless a workflow sets a lower limit", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Draft complete." } }] })
    });
    vi.stubGlobal("fetch", fetch);

    const provider = new LocalOpenAICompatibleProvider({
      baseUrl: "http://127.0.0.1:11434/v1",
      model: "qwen3.5:4b",
      maxTokens: 240
    });
    await provider.complete({ manifest, input });

    const request = fetch.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "qwen3.5:4b",
      max_tokens: 240
    });
  });

  it("uses the concise-workflow default cap", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Draft complete." } }] })
    });
    vi.stubGlobal("fetch", fetch);

    const provider = new LocalOpenAICompatibleProvider({
      baseUrl: "http://127.0.0.1:11434/v1",
      model: "qwen3.5:4b"
    });
    await provider.complete({ manifest, input });

    const request = fetch.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({ max_tokens: 240 });
  });
});
