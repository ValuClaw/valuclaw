import type { Artifact, ContextManifest, WeeklyUpdateInput } from "./types.js";

export interface ModelRequest {
  manifest: ContextManifest;
  input: WeeklyUpdateInput;
}

export interface ModelProvider {
  id: string;
  complete(request: ModelRequest): Promise<ModelCompletion>;
}

export interface ModelCompletion {
  text: string;
  resolvedModelId?: string;
}

export class MockModelProvider implements ModelProvider {
  id = "mock";

  async complete({ manifest, input }: ModelRequest): Promise<ModelCompletion> {
    if (manifest.excluded?.some((item) => item.id === "selected:workbook")) {
      return { text: "BLOCKED: Workbook context is excluded. Include the workbook before drafting model commentary." };
    }
    const workbook = input.workbook;
    if (!workbook) {
      return { text: "BLOCKED: Workbook context is missing." };
    }
    return {
      text: [
        `Topline reached ${workbook.revenue_fy24} in FY24 (Revenue Build - cell F87), up ${workbook.revenue_yoy} YoY.`,
        `Net leverage held at ${workbook.leverage} (Debt Schedule - cell D40).`,
        `The base case assumes ${workbook.churn_current} churn (Assumptions - cell C19), changed from ${workbook.churn_prior}; flagged for review.`,
        "",
        "Open items: confirm the churn assumption change with the deal team."
      ].join("\n")
    };
  }
}

export class OpenAICompatibleProvider implements ModelProvider {
  readonly id: string;

  constructor(
    private readonly options: {
      baseUrl: string;
      model: string;
      apiKey?: string;
      maxTokens?: number;
      timeoutMs?: number;
      extraHeaders?: Record<string, string>;
      requestExtras?: Record<string, unknown>;
    }
  ) {
    this.id = `openai-compatible:${options.model}`;
  }

  async complete({ manifest, input }: ModelRequest): Promise<ModelCompletion> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.options.timeoutMs ?? 60_000);
    let response: Response;
    try {
      response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.options.apiKey ? { authorization: `Bearer ${this.options.apiKey}` } : {}),
          ...this.options.extraHeaders
        },
        body: JSON.stringify({
          model: this.options.model,
          max_tokens: this.options.maxTokens ?? 240,
          stream: false,
          ...this.options.requestExtras,
          messages: [
            {
              role: "system",
              content:
                "You draft source-backed investment work product. Use only the supplied manifest and synthetic input. Do not add market conditions, implications, recommendations, or facts that are not supplied. Cite each material numerical claim with its source ID."
            },
            {
              role: "user",
              content: JSON.stringify({ manifest, input }, null, 2)
            }
          ]
        }),
        signal: abortController.signal
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        throw new Error(`Model request timed out after ${this.options.timeoutMs ?? 60_000}ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      throw new Error(`Model request failed: ${response.status} ${await response.text()}`);
    }
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; model?: string };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Model returned no final text.");
    }
    return {
      text,
      resolvedModelId: json.model
    };
  }
}

// Kept as an alias while downstream integrations migrate to the provider-neutral name.
export const LocalOpenAICompatibleProvider = OpenAICompatibleProvider;

export function artifactFromModelText(text: string, input: WeeklyUpdateInput): Artifact {
  const blocked = text.startsWith("BLOCKED:");
  return {
    id: blocked ? "artifact.weekly_update.blocked" : "artifact.weekly_update.word_section",
    kind: input.outputTarget,
    title: blocked ? "Weekly update blocked" : "Weekly Investment Update",
    body: text,
    citations: blocked
      ? []
      : [
          {
            id: `wb:${input.workbook?.id}#Revenue Build!F87`,
            provider: "workbook",
            as_of: input.workbook?.as_of ?? new Date(0).toISOString(),
            citation: "Revenue Build - cell F87"
          },
          {
            id: `wb:${input.workbook?.id}#Debt Schedule!D40`,
            provider: "workbook",
            as_of: input.workbook?.as_of ?? new Date(0).toISOString(),
            citation: "Debt Schedule - cell D40"
          },
          {
            id: `wb:${input.workbook?.id}#Assumptions!C19`,
            provider: "workbook",
            as_of: input.workbook?.as_of ?? new Date(0).toISOString(),
            citation: "Assumptions - cell C19"
          }
        ],
    review_flags: blocked ? ["workbook_excluded"] : ["churn_changed"],
    blocked
  };
}
