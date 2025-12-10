---
adr: 0001
title: Core Architecture and Tech Stack
status: Accepted
date: 2025-12-08
related_specs:
  - 0001-spec-mcp-server-core
  - 0002-spec-tool-packs-and-workflows
  - 0003-spec-multi-model-routing
---

## 1. Context and problem

We want a **general-purpose, multi-model MCP server** that:

- Minimizes token usage per tool.
- Adapts automatically to new model releases (via `llms.txt` and provider APIs).
- Shares configuration and capabilities across tools.
- Exposes higher-level workflows, not just thin API wrappers.
- Is pleasant to extend, test, and operate.

There are many narrow MCP servers (one per SaaS or data source), and several
frameworks for building new ones, but there is no single, batteries‑included
**multi‑provider, workflow‑oriented** MCP server focused on lean prompts and
developer ergonomics.

## 2. Decision

We build **Contextive MCP Server** with:

- **Language & runtime**
  - **TypeScript** on **Node.js 22+**.
- **MCP implementation**
  - Official **Model Context Protocol** TypeScript bindings & server helpers.
- **LLM orchestration**
  - **Vercel AI SDK v6** as the primary abstraction over LLM providers.
- **Schema & validation**
  - **Zod v4** for all public schemas (config, tool inputs/outputs, resources).
- **Configuration**
  - Single JSON/TOML/YAML config with Zod validation + JSON Schema export.
- **Packaging**
  - NPM package and CLI: `contextive-mcp`.
- **Testing & quality**
  - **Vitest**, **tsup** (or `tsc`+`tsx`), **ESLint** + **Prettier‑style** rules.
- **Observability**
  - Structured logging with `pino` (or equivalent) and optional OTEL hooks.

We treat MCP as the “outer” protocol layer and use Vercel AI SDK + provider
clients as the “inner” model layer. The server is opinionated but framework‑ish:
you can add new “tool packs” with minimal boilerplate.

## 3. Alternatives considered

### 3.1 Python‑only stack (FastAPI + MCP Python SDK)

- Pros:
  - Strong ecosystem for data tooling.
  - Many existing examples of MCP servers in Python.
- Cons:
  - You want deep integration with **Vercel AI SDK v6** and TypeScript tooling.
  - TypeScript is a better fit for MCP’s JSON‑centric, schema‑heavy API surface.
- Score: **8.1** (below our 9.0 threshold).

### 3.2 Go implementation (gofastmcp + custom runtime)

- Pros:
  - Very high performance.
  - Great for static binaries and infra‑heavy deployments.
- Cons:
  - Slower iteration for schema‑heavy APIs.
  - You rely heavily on TS‑first environments (VS Code, Cursor, etc).
- Score: **8.4**.

### 3.3 Minimal MCP wrapper per provider (no central orchestrator)

- Pros:
  - Very simple per‑server code.
- Cons:
  - Fails your requirement for **one multi‑provider MCP server** that exposes
    models, tools, and workflows together.
- Score: **7.9**.

Only the TypeScript + Vercel AI SDK architecture exceeds the 9.0 threshold.

### 3.4 Decision scoring

| Option                    | Sol. Leverage | App. Value | Maint. Load | Arch. Adapt. | Weighted |
|---------------------------|--------------:|-----------:|------------:|-------------:|--------:|
| TypeScript + Vercel AI   | 9.7           | 9.5        | 9.0         | 9.4          | 9.49    |
| Python + FastAPI         | 8.8           | 8.5        | 8.0         | 8.3          | 8.41    |
| Go + gofastmcp           | 8.9           | 8.4        | 8.3         | 8.6          | 8.54    |
| Per‑provider wrappers    | 7.8           | 8.0        | 9.2         | 7.5          | 8.13    |

Weights: Solution Leverage 35%, Application Value 30%, Maintenance Load 25%,
Architectural Adaptability 10%.

## 4. Consequences

- We standardize on TS tooling and MCP’s latest spec.
- Most contributions will use Node/TS; Python code can still be used in
  subprocess tools or external MCP servers.
- We can share schema definitions across:
  - MCP tool inputs/outputs.
  - Internal config.
  - API documentation.
- Vercel AI SDK v6 gives us first‑class multi‑provider and `llms.txt` support
  without building our own abstraction.
