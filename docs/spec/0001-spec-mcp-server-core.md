---
spec: 0001
title: Contextive MCP Server Core Specification
status: Accepted
date: 2025-12-08
adr_refs:
  - 0001-adr-architecture-and-stack
  - 0002-adr-repository-strategy
---

## 1. Scope

Defines the **core behavior** of Contextive MCP Server:

- Process model and lifecycle.
- Protocol implementation requirements.
- Config loading and environment handling.
- Tool/resource/prompt registration and discovery.

## 2. Requirements

### 2.1 MCP protocol compliance

- Implement the latest **Model Context Protocol** specification (2025‑11‑25)
  for the supported transports (stdio first, HTTP optional).
- Required features:
  - Capability discovery for tools, resources, and prompts.
  - Tool invocation with structured inputs/outputs.
  - Resource listing and fetching where applicable.
  - Prompt templates as first‑class MCP entities.

### 2.2 Process model

- Default binary: `contextive-mcp`.
- Supports:
  - **stdio mode** for local tools (Claude Desktop, Cursor, VS Code Copilot).
  - Optional HTTP mode for remote, multi‑client environments.

Behavior:

- On startup:
  - Locate config file path using:
    1. `CONTEXTIVE_CONFIG` env var, if set.
    2. `contextive.config.(json|yaml|yml|toml)` in CWD.
    3. Fallback to embedded defaults.
  - Validate config with Zod.
  - Register tool packs, model providers, resources, and prompts.

- On shutdown:
  - Gracefully flush logs.
  - Cleanup any long‑lived connections (DB pools, caches, etc).

### 2.3 Configuration

- Config is a single object with sections:
  - `server`: ports, transport mode, logging, etc.
  - `providers`: model provider credentials and options.
  - `toolPacks`: enable/disable and pack‑specific settings.
  - `workflows`: composed workflows that chain tools.
- Must be validated with the Zod schema defined in code and with the compiled
  JSON Schema.

### 2.4 Tool registration

- Each tool pack exports:
  - A Zod input schema.
  - A handler function `(input, ctx) => output`.
  - Metadata:
    - `description`, `labels`, `safety_notes`.
    - Optional `invocation_hints` for agents.
- The core server:
  - Discovers tool packs from a registry module (static) and optional plugins.
  - Registers them with the MCP server instance.

### 2.5 Model routing

- The core server exposes an abstraction like:

  ```ts
  interface ModelRouter {
    pickModel(input: ModelRequest): ResolvedModel;
    invokeModel(request: ResolvedModelRequest): Promise<ModelResponse>;
  }
  ```

* The default implementation must support:

  * Static mappings from config.
  * `llms.txt`‑driven discovery when available.
* The router is used by any tool that invokes a model (e.g., summarizers,
  search tools, workflow orchestrators).

## 3. Non‑requirements

* No requirement to implement:

  * Full multi‑tenant auth (can be added later as an extension).
  * UI/dashboard.
* No requirement to support transports beyond stdio/HTTP in the first version.

## 4. Checklists

### 4.1 Implementation checklist

* [ ] CLI entrypoint `contextive-mcp` exists.
* [ ] MCP server implementation passes protocol conformance tests.
* [ ] Config loader supports env var overrides.
* [ ] Zod validation runs on every startup.
* [ ] Tools are registered with:

  * [ ] Name.
  * [ ] Description.
  * [ ] Input schema.
  * [ ] Output schema (even if generic).
* [ ] Model router is injectable and testable in isolation.

### 4.2 Testing checklist

* [ ] Unit tests for config parsing and validation.
* [ ] Unit tests for at least one example tool pack.
* [ ] Integration test for end‑to‑end MCP request flow (stdio harness).
* [ ] Snapshot tests for server description metadata.

