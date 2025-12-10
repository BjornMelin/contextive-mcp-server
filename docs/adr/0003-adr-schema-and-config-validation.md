---
adr: 0003
title: Schema, Config, and Type System
status: Accepted
date: 2025-12-08
related_specs:
  - 0001-spec-mcp-server-core
  - 0003-spec-multi-model-routing
---

## 1. Context

Contextive MCP Server needs:

- Strongly typed tool definitions and inputs.
- Validated configuration across environments.
- A way to expose JSON Schema for tooling (IDE hints, validation, UI forms).

We must choose a single source of truth for schemas to avoid drift.

## 2. Decision

We use:

- **Zod v4** as the **authoritative schema language** for:
  - Config files.
  - Tool inputs/outputs.
  - Internal model metadata where relevant.
- **TypeScript types** are derived from Zod using `z.infer`.
- A small **schema export utility** generates:
  - JSON Schema for configs.
  - JSON Schema fragments for each tool pack, if needed.

Config format:

- The default config is JSON.
- TOML/YAML are allowed via simple loaders that feed into the same Zod schemas.

## 3. Alternatives considered

### 3.1 JSON Schema first, TS types via generators

- Pros:
  - Familiar to many API teams.
  - Good support in external tools and UIs.
- Cons:
  - Type ergonomics inside the codebase are significantly worse than Zod’s.
  - Two‑way sync between types and schemas is more complex.
- Score: **8.5**.

### 3.2 No formal schemas, ad‑hoc runtime validation

- Pros:
  - Low upfront overhead.
- Cons:
  - Violates your KISS/DRY/YAGNI constraints long term:
    - Repeated ad‑hoc validation logic.
    - Hidden assumptions across tools.
- Score: **6.0**.

### 3.3 Zod‑first (chosen)

- Pros:
  - Great DX and TS integration.
  - Easy to derive JSON Schema for external uses.
- Cons:
  - Adds a dependency layer, but one you already intend to use.
- Score: **9.4**.

## 4. Decision scoring

| Option              | Sol. Leverage | App. Value | Maint. Load | Arch. Adapt. | Weighted |
|---------------------|--------------:|-----------:|------------:|-------------:|--------:|
| Zod‑first          | 9.6           | 9.4        | 9.0         | 9.2          | 9.42    |
| JSON Schema‑first  | 8.8           | 8.7        | 8.0         | 8.6          | 8.56    |
| Ad‑hoc             | 6.5           | 6.5        | 6.0         | 6.0          | 6.30    |

## 5. Consequences

- All configs and tools must define Zod schemas.
- We can generate machine‑readable schemas for:
  - MCP server descriptions.
  - External dashboards or config UIs.
- Any change to input/output shapes is visible in TypeScript types, config
  validation, and MCP metadata at once.
