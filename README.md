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

- **Command:** `contextive-mcp`
- **Args:** `serve --stdio`
- **Working directory:** A project folder with `contextive.config.json`
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

- **Multi‑provider models**

  - Route across providers via a single interface.
- **Token‑efficient prompts**

  - Shared prompts per pack, concise tool descriptions, explicit budgets.
- **Workflows**

  - Define workflows declaratively, expose as tools.
- **Config‑first**

  - One config file, validated with Zod and JSON Schema.
- **Observability**

  - Structured logging, request IDs, optional OTEL integration.

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

- Start with `docs/PRD.md` and `docs/adr/0001-adr-architecture-and-stack.md`.
- Use `AGENTS.md` for agent behavior when working on this repo via MCP.
- Run:

  - `npm test`
  - `npm run lint`
  - `npm run build`

Please keep changes aligned with the ADRs and specs; propose new ADRs for
significant architecture changes.
