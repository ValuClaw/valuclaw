# Local customer setup

This is the smallest useful deployment of ValuClaw on one Mac: a local harness, a Word task pane, explicit context, local run history, and a deterministic synthetic workflow. It does **not** connect to Microsoft Graph, customer storage, or licensed data vendors.

## What stays where

- The Word task pane is served from `https://localhost:3100`.
- Run manifests, artifacts, audit logs, memory exports, and history stay in `.valuclaw/` inside this checkout by default.
- The deterministic mode sends nothing to a model endpoint.
- The optional local-model mode sends the selected synthetic context only to `VALUCLAW_MODEL_BASE_URL`. Use `http://127.0.0.1:11434/v1` for Ollama on the same machine.

## One-time setup

From the repository root:

```bash
pnpm install
pnpm office:doctor
pnpm office:cert
pnpm office:sideload:word
```

`pnpm office:cert` creates a development-only localhost certificate and asks macOS to trust it. It is required because Office add-ins load over HTTPS. `pnpm office:sideload:word` copies only the ValuClaw manifest into Word's per-user developer folder.

## Run the Word proof

```bash
pnpm office:serve
```

Leave that terminal running. Restart Word, open a blank document, and choose **Home > Add-ins > ValuClaw**. Select `Deterministic synthetic run`, keep workbook context checked, and generate. The drafted text is inserted at the current selection; the source lineage, pending approval, explicit model path, and local run history remain visible in the pane.

Untick workbook context and run again. The harness must block commentary rather than draft unsupported numbers.

## Use a local model

The Word pane does not carry a model API key. The local bridge does, through environment variables set in the terminal that starts it.

For an OpenAI-compatible local endpoint such as Ollama:

```bash
export VALUCLAW_MODEL='qwen3.5:4b'
export VALUCLAW_MODEL_BASE_URL='http://127.0.0.1:11434/v1'
export VALUCLAW_MODEL_MAX_TOKENS='240'
pnpm office:serve
```

`qwen3.5:4b` is already present on this development machine; replace it with any model your local endpoint exposes. The default response limit is 240 tokens; raise it only for a workflow that needs a longer artifact. Restart the bridge after changing those variables, then select `Configured local model` in Word. The pane displays the endpoint receiving the selected context. Do not point this at a hosted endpoint until its data-handling terms are approved.

The CLI uses the same path without any Office UI:

```bash
pnpm valuclaw run weekly-update --input fixtures/weekly-update/input.json --provider openai-compatible --model "$VALUCLAW_MODEL"
```

## What requires a later customer decision

- Microsoft files, Outlook, Teams, and SharePoint require Microsoft identity and narrow delegated Graph scopes. No Microsoft account is requested or used in this local proof.
- Licensed vendor integrations require the customer's entitlement, allowed-use, retention, and redistribution rules. The current public provider is SEC/EDGAR only.
- Shared deployment needs a customer-controlled hostname, certificate, app catalog/central deployment, and an explicit retention plan. Localhost is intentionally for one-user proof only.
