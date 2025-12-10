---
spec: 0002
title: Tool Packs and Workflow Chaining
status: Accepted
date: 2025-12-08
adr_refs:
  - 0001-adr-architecture-and-stack
---

## 1. Scope

Defines how Contextive MCP Server:

- Groups tools into **tool packs**.
- Exposes **workflows** as higher‑level, reusable prompts.
- Minimizes per‑tool prompt/token overhead.

## 2. Tool packs

### 2.1 Concept

A **tool pack** is a logical bundle of tools that share:

- Purpose (e.g., filesystem, HTTP, search, code analysis).
- Shared configuration (e.g., base URLs, auth, caching settings).
- Shared prompts/system context where applicable.

### 2.2 Design rules

- Each tool pack must:
  - Live in its own module under `src/tool-packs/<pack-name>`.
  - Export:
    - Tool Zod schemas.
    - Typed handlers.
    - A `registerWith(server)` function that wires them into MCP.
- Shared prompts for a pack must:
  - Be defined once.
  - Be reused across tools for that pack rather than duplicated.

### 2.3 Token usage constraints

- Any tool description or prompt used for MCP metadata must:
  - Be concise and contain only what the agent needs.
  - Avoid marketing fluff.
- For each pack, add an internal **prompt budget** (target max tokens for
  descriptions and system prompts).

## 3. Workflows

### 3.1 Concept

A **workflow** is:

- A named, configurable sequence of tool calls and model invocations.
- Exposed to agents as:
  - Either a single MCP tool with higher‑level semantics, or
  - A prompt with associated guidance for the agent.

Examples:

- `project_audit`: scan repository, analyze open issues, produce a report.
- `incident_triage`: query logs, run health checks, summarize findings.

### 3.2 Definition format

Workflows are defined in config:

```jsonc
{
  "workflows": {
    "project_audit": {
      "description": "Audit the current project for risks and TODOs.",
      "steps": [
        { "tool": "fs.read_tree", "params": { "root": "." } },
        { "tool": "code.analyze", "params": { "level": "summary" } },
        { "model": "gpt-4.1-mini", "prompt": "Summarize findings..." }
      ]
    }
  }
}
````

The server translates this into either:

* A single MCP tool `workflow.project_audit`, or
* A documented pattern for agents via prompt metadata.

### 3.3 Execution rules

* Workflows must:

  * Be deterministic from the MCP client’s perspective.
  * Produce structured output (JSON) whenever feasible.
* Error handling:

  * If a step fails, the workflow must:

    * Provide a structured error.
    * Optionally attempt fallback steps (configurable).

## 4. Checklists

### 4.1 Tool pack checklist

* [ ] Pack lives under `src/tool-packs/<name>`.
* [ ] Pack exports a `registerWith(server)` function.
* [ ] Each tool has:

  * [ ] Concise description.
  * [ ] Zod input schema.
  * [ ] Zod output schema.
* [ ] Pack‑level prompts are shared, not duplicated.

### 4.2 Workflow checklist

* [ ] Workflow definitions are validated against a Zod schema.
* [ ] Each workflow has:

  * [ ] Name.
  * [ ] Description.
  * [ ] Steps array with tool/model references.
* [ ] At least one end‑to‑end test for a non‑trivial workflow.

