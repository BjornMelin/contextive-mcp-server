---
adr: 0002
title: Repository Strategy and Relationship to Legacy Servers
status: Accepted
date: 2025-12-08
related_specs:
  - 0001-spec-mcp-server-core
---

## 1. Context

There is an existing Python‑heavy MCP server ecosystem, and you already
maintain a customized Python server for your own workflows. That code has:

- Tight coupling to a specific project history.
- Higher per‑tool prompt/token overhead.
- Limited reuse of common configuration and schemas.

We must decide whether **Contextive MCP Server** should:

1. Continue as a direct fork and evolution of a legacy codebase, or
2. Be a fresh repository with clean boundaries and minimal assumptions.

## 2. Decision

We choose:

- **A fresh repository**: `contextive-mcp-server`.
- Not a fork of any prior MCP server.
- Migration paths and compatibility notes can reference “legacy servers” but do
  not name or depend on any specific project.

Compatibility goals:

- Import as many patterns and learnings as possible from existing MCP servers
  (yours and others) *by design*, not by inheritance.
- Allow drop‑in migration:
  - Similar environment variable naming patterns.
  - Familiar config file shapes.
  - Equivalent tools where that makes sense.

## 3. Alternatives considered

### 3.1 Hard fork of existing Python server

- Pros:
  - Immediate feature parity.
  - Existing clients can plug in quickly.
- Cons:
  - You inherit technical debt and inconsistent design decisions.
  - The code is not aligned with the TypeScript + Vercel AI SDK direction.
- Score: **7.5**.

### 3.2 Hybrid monorepo (Python + TypeScript)

- Pros:
  - Shared issues and roadmap.
  - Clear migration story.
- Cons:
  - Mixed toolchains increase contributor friction.
  - Harder to maintain crisp boundaries and enforce quality consistently.
- Score: **8.2**.

### 3.3 Fresh TypeScript repo (chosen)

- Pros:
  - Clean slate aligned with new architecture.
  - Fewer constraints: we can push token optimizations and new workflows
    aggressively without breaking old assumptions.
- Cons:
  - Requires explicit migration docs.
- Score: **9.2**.

## 4. Decision scoring

| Option                 | Sol. Leverage | App. Value | Maint. Load | Arch. Adapt. | Weighted |
|------------------------|--------------:|-----------:|------------:|-------------:|--------:|
| Fresh TS repo         | 9.4           | 9.2        | 9.0         | 9.0          | 9.23    |
| Hybrid monorepo       | 8.6           | 8.5        | 7.8         | 8.4          | 8.36    |
| Python hard fork      | 7.8           | 7.9        | 7.0         | 7.6          | 7.63    |

## 5. Consequences

- `contextive-mcp-server` stands on its own.
- We can still publish **migration guides** and example config mappings.
- The new repo is free of historical branding and is positioned as a modern,
  multi‑provider, workflow‑oriented MCP server.
