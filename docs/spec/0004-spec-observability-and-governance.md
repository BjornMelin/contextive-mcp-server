---
spec: 0004
title: Observability, Governance, and Safety Controls
status: Accepted
date: 2025-12-08
adr_refs:
  - 0004-adr-observability-and-ops
---

## 1. Scope

Specifies:

- Logging and metrics exposure.
- Safety and governance hooks (rate limiting, allow/deny lists).
- Minimal controls to make Contextive MCP Server safe to expose to agents.

## 2. Logging

- All MCP requests must log at least:
  - Timestamp, `requestId`, `toolName`, `durationMs`, `status`.
- Log levels:
  - `debug`: development details.
  - `info`: high‑level events (tool usage).
  - `warn`: recoverable anomalies.
  - `error`: failures.

## 3. Metrics

- Initial metrics surface:
  - Tool call counts by tool name.
  - Error rates by tool name.
  - Latency histograms.
- Export options:
  - Basic stdout logs in structured JSON.
  - OTEL metrics when configured.

## 4. Safety and governance

- Configurable controls:
  - **Tool allow/deny list**:
    - e.g. `allowedTools`, `blockedTools` per environment.
  - **Rate limiting**:
    - Simple per‑tool and global request rate caps.
  - **Model guardrails**:
    - Optional configuration of safety system prompts for tools that call LLMs.
- Tools handling sensitive operations (e.g., filesystem write, HTTP requests)
  must:
  - Have explicit, concise descriptions of side effects.
  - Require parameters that prevent accidental broad operations (e.g. no
    “delete everything” tool without tight checks).

## 5. Checklists

### 5.1 Logging / metrics checklist

- [ ] Each request has a `requestId`.
- [ ] Tool calls log duration and outcome.
- [ ] At least one metrics endpoint or export exists in HTTP mode.

### 5.2 Safety checklist

- [ ] Tools with side effects are clearly documented.
- [ ] Allow/deny list is applied at registration or dispatch time.
- [ ] Rate limiting is enforced where configured.

