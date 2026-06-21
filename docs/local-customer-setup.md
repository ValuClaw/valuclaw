# Local customer setup

This is the smallest useful deployment of ValuClaw on one Mac: a local harness, a Word task pane, explicit context, local run history, and an OpenRouter-routed synthetic workflow. It does **not** connect to Microsoft Graph, customer storage, or licensed data vendors.

## What stays where

- The Word task pane is served from `https://localhost:3100`.
- Run manifests, artifacts, audit logs, memory exports, and history stay in `.valuclaw/` inside this checkout by default.
- The selected synthetic context is sent to OpenRouter. Start on Auto or choose GPT-5.5, Claude Opus 4.8, Claude Sonnet 4.6, Gemini 3.5 Flash, or DeepSeek V4 Flash. The returned run records both the selected route and the model OpenRouter resolved.
- `OPENROUTER_API_KEY` is read only by the local bridge process. It is never sent to Word, written to a run artifact, or committed to the repository.

## One-time setup

From the repository root:

```bash
pnpm install
pnpm office:doctor
pnpm office:cert
pnpm office:sideload:word
export OPENROUTER_API_KEY='your-openrouter-key'
```

`pnpm office:cert` creates a development-only localhost certificate and asks macOS to trust it. It is required because Office add-ins load over HTTPS. `pnpm office:sideload:word` copies only the ValuClaw manifest into Word's per-user developer folder.

## Run the Word proof

```bash
pnpm office:serve
```

Leave that terminal running. Restart Word, open a blank document, and choose **Home > Add-ins > ValuClaw**. Keep workbook context checked and generate. The drafted text is inserted at the current selection; the source lineage, pending approval, selected model route, resolved model, and local run history remain visible in the pane.

Untick workbook context and run again. The harness must block commentary rather than draft unsupported numbers.

## Model choice without an unsafe model menu

The Word pane does not carry a model API key. It starts on `openrouter/auto` and gives you a **Model roster** panel. Enter up to five OpenRouter model IDs, one per line; they are saved only in your browser's local storage. The run dropdown contains Auto plus that roster. Auto routes only within the saved roster; a pinned run must choose a model in it. The local bridge returns the actual model identifier. This provides practical choice without a free-form model field on every run, and does not claim that customers are locked to OpenRouter.

Set a bounded response size if required:

```bash
export VALUCLAW_MAX_TOKENS='240'
pnpm office:serve
```

The default response limit is 240 tokens; raise it only for a workflow that needs a longer artifact. The open core keeps its provider-neutral adapter, so later deployments can move this local roster into an organisation-approved model registry, use another OpenAI-compatible endpoint, or add a first-class provider adapter without changing the workflow, context manifest, skills, or history.

The CLI uses the same path without any Office UI:

```bash
pnpm valuclaw run weekly-update --input fixtures/weekly-update/input.json --provider openai-compatible --base-url https://openrouter.ai/api/v1 --model openrouter/auto --api-key-env OPENROUTER_API_KEY
```

## What requires a later customer decision

- Microsoft files, Outlook, Teams, and SharePoint require Microsoft identity and narrow delegated Graph scopes. No Microsoft account is requested or used in this local proof.
- Licensed vendor integrations require the customer's entitlement, allowed-use, retention, and redistribution rules. The current public provider is SEC/EDGAR only.
- Shared deployment needs a customer-controlled hostname, certificate, app catalog/central deployment, and an explicit retention plan. Localhost is intentionally for one-user proof only.
