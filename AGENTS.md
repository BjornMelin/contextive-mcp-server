# AGENTS – Guidance for AI agents working on Contextive MCP Server

This file defines rules and expectations for AI agents (e.g., ChatGPT, Claude,
Cursor) that contribute to this repository via MCP or editor integrations.

## 1. Primary objectives

- Implement and extend **Contextive MCP Server** according to:
  - ADRs in `docs/adr`.
  - Specs in `docs/spec`.
  - Requirements in `docs/PRD.md`.

## 2. Ground rules

1. **Follow ADRs and specs first**
   - Do not change architecture without a new ADR.
   - Keep implementations consistent with existing decisions.

2. **Keep it lean**
   - Avoid unnecessary abstractions (respect KISS/DRY/YAGNI).
   - Prefer libraries that cover ≥ 80% of needs at ≤ 30% custom complexity.

3. **Type safety and schemas**
   - All new config or tool inputs/outputs:
     - Must have Zod schemas.
     - Must expose types via `z.infer`.

4. **Testing**
   - Every new feature must have tests.
   - Do not break existing tests; if you must adjust them, explain why.

5. **Logging and safety**
   - Use the shared logging utilities.
   - Treat side‑effectful tools (FS writes, HTTP POST, etc.) as sensitive.
   - Document side effects clearly.

## 3. What agents should not do

- Do not introduce dependencies that:
  - Are unmaintained.
  - Duplicate capabilities of existing dependencies.
- Do not bypass config validation or schema definitions.
- Do not add marketing content to tool descriptions.

## 4. Implementation checklists

When adding a new **tool pack**:

- [ ] Add it under `src/tool-packs/<name>`.
- [ ] Define:
  - [ ] Zod input schema(s).
  - [ ] Zod output schema(s).
  - [ ] Handler(s).
- [ ] Register via a shared registry in `src/core`.

When adding a new **workflow**:

- [ ] Update workflow schema.
- [ ] Add a test for the workflow.
- [ ] Document it briefly in the README or a dedicated doc.

## 5. Interaction model

Agents interacting with this repo should:

- Prefer reading ADRs/specs before writing code.
- Use search to find existing patterns before inventing new ones.
- Keep changes small and focused; avoid large, mixed‑concern edits.
