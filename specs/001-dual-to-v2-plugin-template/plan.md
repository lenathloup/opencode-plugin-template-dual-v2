# Implementation Plan: Dual-to-V2 Plugin Template

**Feature**: 001-dual-to-v2-plugin-template
**Status**: Draft

## Architecture Decisions

### ADR-1: Template is a single .ts file
The template lives as one TypeScript file under `templates/`. A single file is copy-pasteable and keeps the dual shape visible in one place. Supporting modules (convergence script) live beside it.

### ADR-2: Convergence script is a Node script
A small Node script (`templates/converge.mjs`) reads the template file, removes the V1 import line and the `server` property, and writes the result. It is idempotent: if markers are absent, it prints "already V2-only" and exits 0.

### ADR-3: V2 hook mapping demonstrated
The template demonstrates:
- `ctx.tool.hook("execute.before", ...)` (V2) <-> `"tool.execute.before"` (V1)
- `ctx.tool.hook("execute.after", ...)` (V2) <-> `"tool.execute.after"` (V1)
- `ctx.tool.transform(...)` for custom tool registration (V2 only; V1 uses `tool` map)

### ADR-4: No runtime deps beyond SDKs
Template imports only `@opencode/plugin` (V2) and optionally `@opencode-ai/plugin` (V1). No other deps, keeping it copy-pasteable.

### Alternatives considered
- Multiple template files (one per hook type): rejected for simplicity (Article I); single file is more copy-pasteable.
- Manual convergence checklist only: rejected in favor of automated script (user decision: automated).
- V2-only template (no dual): rejected; dual support needed during migration window.

## Component Boundaries

| Component | Responsibility | Files |
|-----------|----------------|-------|
| Template | Dual V1+V2 plugin scaffold with hooks + custom tool + convergence comments | `templates/plugin-dual-to-v2.ts` |
| Convergence script | Removes V1 markers, writes V2-only file | `templates/converge.mjs` |
| Tests | Verify template loads in V2, convergence produces V2-only file | `tests/template.test.ts` |

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| V2 API changes in future tags | Pin @opencode/plugin version; document tested version |
| Template drift from real plugins | Template derived from actual speckit-perfmon/guard/contexts |
| Convergence script corrupts file | Script operates on a copy; original untouched; idempotent check |

## Task Breakdown

See tasks.md.
