---
spec: 0005
title: Developer Experience and CLI
status: Accepted
date: 2025-12-08
adr_refs:
  - 0002-adr-repository-strategy
---

## 1. Scope

Defines DX and CLI behavior for Contextive MCP Server.

## 2. CLI entrypoint

Binary name: `contextive-mcp`.

Commands:

- `contextive-mcp serve`
  - Start the MCP server (stdio or HTTP, based on flags).
- `contextive-mcp check`
  - Validate config and print summary of loaded tools and providers.
- `contextive-mcp describe`
  - Output server description JSON for debugging.
- `contextive-mcp dev`
  - Start server in watch mode for local development.

## 3. Developer workflows

- Repo uses:
  - `pnpm` scripts (preferred; baseline config assumes `pnpm`).
- Common scripts:
  - `pnpm test`: run tests.
  - `pnpm run lint`: run ESLint.
  - `pnpm run build`: build the server.
  - `pnpm run dev`: run in watch mode (stdio).

## 4. Checklists

### 4.1 CLI checklist

- [ ] `contextive-mcp` is available after global install.
- [ ] Help output documents all commands and flags.
- [ ] Exit codes:
  - `0` on success.
  - Non‑zero for validation or runtime failures.

### 4.2 DX checklist

- [ ] `README.md` has clear quick‑start instructions.
- [ ] `AGENTS.md` defines rules for agents interacting with the repo.
- [ ] Automated tests run in CI and locally with a single command.
