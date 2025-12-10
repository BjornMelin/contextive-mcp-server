# Product Requirements Document – Contextive MCP Server

## 1. Product overview

**Contextive MCP Server** is a **multi‑provider, workflow‑oriented Model Context
Protocol (MCP) server** that:

- Exposes multiple LLM providers through a single, lean MCP surface.
- Bundles tools into reusable **tool packs**.
- Offers higher‑level **workflows** instead of just thin API wrappers.
- Minimizes per‑tool token overhead while staying aligned with the latest MCP
  spec and ecosystem.

It is designed as a stand‑alone MCP server usable by:

- ChatGPT, Claude, Cursor, VS Code Copilot, Windsurf, etc.
- Agent frameworks that speak MCP directly.

## 2. Goals and non‑goals

### 2.1 Goals

1. **Multi‑provider support**
   - Support at least two major providers (e.g. OpenAI, Anthropic) via the
     Vercel AI SDK v6.
   - Use `llms.txt` and provider metadata where available to auto‑discover
     models and reduce manual updates.

2. **Token‑efficient tools**
   - Reduce token usage for tool descriptions and prompts vs “naive” MCP
     servers, targeting ≥ 50% reduction in description tokens per tool.

3. **Composable workflows**
   - Enable reusable workflows that chain tools and LLMs into higher‑level
     capabilities exposed as single tools or prompts.

4. **Strong DX**
   - Clear, spec‑driven architecture.
   - CI‑ready test suite.
   - Easy extension via new tool packs and providers.

5. **Future‑proof MCP compliance**
   - Aligned with the latest MCP spec, including resources and prompts where
     appropriate.

### 2.2 Non‑goals (v1)

- No managed SaaS offering (self‑hosted and CLI‑oriented only).
- No full UI dashboard (logs/metrics only via logs and optional OTEL).
- No hard multi‑tenant auth layer in v1.

## 3. Users and use cases

### 3.1 Users

- Individual developers:
  - Want a single server to access local filesystem, HTTP, Git, and common
    SaaS integrations via MCP.
- Teams:
  - Need a standardized, versioned tool and workflow surface for multiple AI
    clients (ChatGPT, Claude, Cursor, etc.).
- Platform engineers:
  - Want to centralize tool definitions and governance while allowing agents
    to run across multiple environments.

### 3.2 Sample use cases

- **Dev workflow automation**
  - Tools for:
    - Repository inspection.
    - Issue/PR querying.
    - Test execution and summarization.
- **Ops and SRE**
  - Tools for:
    - Log querying.
    - Health checks.
    - Incident summaries.

## 4. Functional requirements

### 4.1 MCP core

- The server must:
  - Implement tools, resources, and prompts per MCP spec.
  - Serve a machine‑readable server description.
  - Support stdio transport.

### 4.2 Provider and model support

- At least two providers configurable via `providers` section.
- Ability to:
  - List available models.
  - Route by model name or task type.

### 4.3 Tool packs

- v1 should include:
  - Filesystem pack (read‑only initially).
  - HTTP pack (read‑only GET/HEAD/limited POST).
  - A minimal “introspect server” pack for debugging.
- Each pack must be togglable via config.

### 4.4 Workflows

- Workflow engine:
  - Accepts declarative workflow definitions from config.
  - Executes steps sequentially with structured errors.
- At least one **example workflow** included and tested.

### 4.5 Observability

- Structured JSON logging.
- Request‑scoped IDs.
- Optional OTEL hooks.

## 5. Non‑functional requirements

- **Performance**
  - No visible bottleneck beyond provider APIs.
  - Low overhead for config parsing and tool registration.

- **Security**
  - Safe defaults:
    - Read‑only FS tools by default.
    - No network tools enabled by default unless explicitly configured.
  - Clear documentation of side‑effectful tools.

- **Reliability**
  - Minimal crash surface:
    - Validation errors MUST fail fast on startup.
    - Tool errors must not crash the process.

## 6. Release criteria

For v1:

- All core specs (0001–0005) implemented and checked off.
- At least:
  - 80% statement coverage on core modules.
  - 100% coverage on config validation.
- README and AGENTS docs present and up‑to‑date.
- Example configs for:
  - ChatGPT MCP.
  - Claude Desktop.
  - One code editor (VS Code / Cursor).
```

---

### 3.4 README and AGENTS

#### **`README.md`**

````markdown
# Contextive MCP Server

**Contextive MCP Server** is a **multi‑provider, workflow‑oriented Model Context
Protocol (MCP) server** written in TypeScript.

It focuses on:

- **Lean, token‑efficient tools**
  - Concise tool descriptions and shared prompts to reduce per‑tool prompt
    overhead.
- **Multi‑model routing**
  - Use Vercel AI SDK v6 to talk to multiple providers through one server.
- **Composable workflows**
  - Chain tools and models into higher‑level workflows exposed as single tools.
- **Spec‑driven design**
  - ADRs and specs define the architecture. Tests enforce it.

> This project is designed as a **fresh MCP server**, not a fork of any legacy
> implementation.

---

## Quick start

### Install

```bash
npm install -g contextive-mcp-server
# or
npx contextive-mcp-server@latest --help
````

### Run in stdio mode

Most MCP clients (ChatGPT, Claude Desktop, Cursor, etc.) expect a stdio
command.

Configure your client with:

* **Command:** `contextive-mcp`
* **Args:** `serve --stdio`
* **Working directory:** A project folder with `contextive.config.json`
  (optional; see below).

### Minimal config

Create `contextive.config.json` in your project:

```jsonc
{
  "server": {
    "mode": "stdio",
    "logLevel": "info"
  },
  "providers": {
    "openai": {
      "apiKey": "$OPENAI_API_KEY",
      "defaultModel": "gpt-4.1-mini"
    }
  },
  "toolPacks": {
    "fs": { "enabled": true, "mode": "read-only" },
    "http": { "enabled": false }
  }
}
```

Then run:

```bash
contextive-mcp serve --stdio
```

Your MCP client should now discover tools like `fs.read_file`, `fs.list_dir`,
and an introspection tool pack.

---

## Features

* **Multi‑provider models**

  * Route across providers via a single interface.
* **Token‑efficient prompts**

  * Shared prompts per pack, concise tool descriptions, explicit budgets.
* **Workflows**

  * Define workflows declaratively, expose as tools.
* **Config‑first**

  * One config file, validated with Zod and JSON Schema.
* **Observability**

  * Structured logging, request IDs, optional OTEL integration.

---

## Project structure

```text
.
├─ src/
│  ├─ core/              # MCP server glue, config, routing
│  ├─ tool-packs/        # Individual tool packs
│  ├─ workflows/         # Workflow engine and definitions
│  └─ cli/               # contextive-mcp entrypoint
├─ config/
│  ├─ default.config.json
│  └─ config.schema.json
├─ docs/
│  ├─ adr/
│  ├─ spec/
│  └─ PRD.md
└─ package.json
```

See `docs/adr` and `docs/spec` for detailed design.

---

## For contributors

* Start with `docs/PRD.md` and `docs/adr/0001-adr-architecture-and-stack.md`.
* Use `AGENTS.md` for agent behavior when working on this repo via MCP.
* Run:

  * `npm test`
  * `npm run lint`
  * `npm run build`

Please keep changes aligned with the ADRs and specs; propose new ADRs for
significant architecture changes.

