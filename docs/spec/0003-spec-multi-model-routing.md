---
spec: 0003
title: Multi-Model Routing and Dynamic Provider Support
status: Accepted
date: 2025-12-08
adr_refs:
  - 0001-adr-architecture-and-stack
  - 0003-adr-schema-and-config-validation
---

## 1. Scope

Defines how Contextive MCP Server:

- Discovers and exposes multiple model providers.
- Routes requests to models based on config and hints.
- Uses `llms.txt` and provider metadata to reduce maintenance overhead.

## 2. Model provider abstraction

We define a provider‑agnostic interface:

```ts
interface ModelProvider {
  id: string;
  listModels(): Promise<ModelInfo[]>;
  invoke(request: ModelInvokeRequest): Promise<ModelInvokeResponse>;
}
````

* `ModelInfo` includes:

  * `name`, `family`, `contextWindow`, `inputCost`, `outputCost`, etc.
* Providers encapsulate:

  * Authentication.
  * Base URL, versioning, and transport details.

## 3. Discovery and `llms.txt`

* On startup, the server:

  * Optionally fetches `llms.txt` for configured providers when available.
  * Merges:

    * Provider‑native model lists.
    * `llms.txt` hints and annotations.
* The merged registry is stored in memory and optionally cached on disk.

This reduces the need to manually update the codebase for each new model
release, as long as the provider surfaces it via API or `llms.txt`.

## 4. Routing

### 4.1 Static routing

* Config can specify defaults:

```jsonc
{
  "providers": {
    "openai": { "defaultModel": "gpt-4.1-mini" },
    "anthropic": { "defaultModel": "claude-3.7-sonnet" }
  },
  "routing": {
    "summarization": { "model": "gpt-4.1-mini" },
    "code": { "model": "gpt-4.1" }
  }
}
```

* Tools can request a **task type** (e.g. `"summarization"`, `"code"`) instead
  of a specific model name.

### 4.2 Dynamic routing

* The router may also use:

  * Context window requirements (based on estimated input size).
  * Cost preferences (cheapest within a family).
  * Performance hints from config (e.g., “prefer this family for code”).

### 4.3 Failure handling

* If a requested model is not available:

  * Fallback to a configured backup.
  * Emit a structured warning in logs and in the tool result.

## 5. Checklists

### 5.1 Provider integration checklist

* [ ] Provider implements `ModelProvider` interface.
* [ ] Provider has unit tests for:

  * [ ] `listModels()`.
  * [ ] `invoke()` with basic prompts.
* [ ] Provider’s config schema is defined and validated.

### 5.2 Router checklist

* [ ] Router can:

  * [ ] Select models by explicit name.
  * [ ] Select models by task type.
* [ ] Router exposes structured errors when routing fails.
* [ ] Router’s behavior is tested with a mock provider registry.

