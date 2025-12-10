---
adr: 0004
title: Observability, Logging, and Operations
status: Accepted
date: 2025-12-08
related_specs:
  - 0004-spec-observability-and-governance
---

## 1. Context

Contextive MCP Server will be used in:

- Local developer environments (VS Code, Cursor, Claude Desktop).
- Shared dev/staging environments.
- Potentially production‑grade deployments with many tools and models.

We need:

- Low‑overhead logging.
- A consistent correlation ID / trace ID to debug multi‑tool workflows.
- Optional hooks into OTEL‑compatible tracing.

## 2. Decision

We adopt:

- **Structured logging** via `pino` (or equivalent).
- A standardized **request context** object containing:
  - `requestId` / `traceId` for each MCP call.
  - `toolName`, `modelName`, and timing info.
- Simple **log levels**: `debug`, `info`, `warn`, `error`.
- Optional **OTEL integration** behind a feature flag / small adapter:
  - Spans around MCP requests and tool invocations.
  - Export via OTLP when configured.

The default behavior for local use:

- Pretty‑printed logs.
- Minimal noise (info and above).

## 3. Alternatives considered

### 3.1 No structured logs

- Pros:
  - Less code at the start.
- Cons:
  - Harder to debug multi‑tool chains.
  - Inconsistent with best practices for MCP servers and agents. :contentReference[oaicite:3]{index=3}  
- Score: **6.5**.

### 3.2 Heavy OTEL‑first approach

- Pros:
  - Very rich observability out of the gate.
- Cons:
  - Overkill for local use.
  - Raises cognitive load for new contributors.
- Score: **8.3**.

### 3.3 Lean structured logging + optional OTEL (chosen)

- Pros:
  - Good default tradeoff between simplicity and power.
  - Works well for both CLI and long‑running processes.
- Cons:
  - Requires simple context propagation across layers.
- Score: **9.1**.

## 4. Decision scoring

| Option                       | Sol. Leverage | App. Value | Maint. Load | Arch. Adapt. | Weighted |
|------------------------------|--------------:|-----------:|------------:|-------------:|--------:|
| Structured + optional OTEL  | 9.3           | 9.0        | 8.8         | 9.0          | 9.08    |
| OTEL‑first                   | 8.8           | 8.7        | 7.9         | 9.1          | 8.55    |
| No structured logging        | 6.8           | 6.8        | 6.5         | 6.5          | 6.63    |

## 5. Consequences

- Every tool invocation and MCP request must include a context object.
- Logging helpers will be provided and must be used across the codebase.
- Adding OTEL later is straightforward and does not change core behavior.
