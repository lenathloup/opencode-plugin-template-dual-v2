# README Draft (plan) — opencode-plugin-template-dual-v2

> Draft for review. Final file should be moved to repository root as `README.md`.

## Title
opencode-plugin-template-dual-v2

## Sections

### 1. Overview
One paragraph: reusable OpenCode plugin template supporting dual V1+V2 shape during migration, with an automated convergence script to V2-only. Single source of truth for plugin shape (Constitution Article VIII).

### 2. What's included
- templates/plugin-dual-to-v2.ts — dual V1+V2 plugin scaffold (hooks + custom tool)
- templates/converge.mjs — automated convergence to V2-only
- tests/template.test.ts — integration tests (vitest)

### 3. Requirements
- Node >= 22
- @opencode/plugin (V2, dev/runtime)
- @opencode-ai/plugin (V1, optional, for dual support)
- zod (runtime validation)

### 4. Quick start
1. Copy templates/plugin-dual-to-v2.ts into your plugin directory, rename.
2. Edit id, hooks, custom tool.
3. Register in opencode.json(c) under "plugins".
4. (Optional) Keep V1 support during migration; remove later.

### 5. Converging to V2-only
- node templates/converge.mjs <file> → writes <file>.v2.ts
- node templates/converge.mjs <file> --in-place
- node templates/converge.mjs <file> --out <path>
- Idempotent: re-running on a V2-only file prints "already V2-only".

### 6. Hook mapping (V1 -> V2)
Table: tool.execute.before -> ctx.tool.hook("execute.before"), etc. (from migration guide).

### 7. Repository structure
Tree.

### 8. Testing
- npm install (requires package.json — TBD)
- npx vitest run

### 9. License
MIT.

### 10. References
- OpenCode plugin docs: https://opencode.ai/v2/docs/plugins/
- Migration guide: https://opencode.ai/v2/docs/build/plugins/migrate-v1/
- awesome-opencode: https://github.com/awesome-opencode/awesome-opencode
