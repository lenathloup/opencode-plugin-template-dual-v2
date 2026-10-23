# opencode-plugin-template-dual-v2

Reusable OpenCode plugin template that supports the **dual V1+V2 shape** during migration and ships an **automated convergence script** to V2-only. Single source of truth for plugin shape in this repository (Constitution Article VIII).

## What's included

- `templates/plugin-dual-to-v2.ts` — dual V1+V2 plugin scaffold (hooks + custom tool)
- `templates/converge.mjs` — automated convergence to V2-only
- `tests/template.test.ts` — integration tests (vitest)

## Requirements

- Node >= 22
- `@opencode/plugin` (V2 runtime)
- `@opencode-ai/plugin` (V1, optional, only for dual support during migration)
- `zod` (runtime validation)

## Quick start

1. Copy `templates/plugin-dual-to-v2.ts` into your plugin directory and rename it.
2. Edit the `id`, hooks, and custom tool (`template_hello`) to fit your plugin.
3. Register the plugin in `opencode.json(c)` under the `plugins` array.
4. (Optional) Keep V1 support during migration; remove it later with the convergence script.

## Converging to V2-only

Run the convergence script to strip V1 code automatically:

```sh
# Write a .v2.ts sibling
node templates/converge.mjs path/to/plugin.ts

# Overwrite in place
node templates/converge.mjs path/to/plugin.ts --in-place

# Custom output path
node templates/converge.mjs path/to/plugin.ts --out path/to/plugin.v2.ts
```

The script is idempotent: re-running on an already V2-only file prints `already V2-only: no V1 markers found` and exits 0.

## Hook mapping (V1 -> V2)

| V1 (`@opencode-ai/plugin`) | V2 (`@opencode/plugin`) |
|---|---|
| `"tool.execute.before"` | `ctx.tool.hook("execute.before", ...)` |
| `"tool.execute.after"` | `ctx.tool.hook("execute.after", ...)` |
| `permission.ask` | `ctx.permission.hook("evaluate", ...)` |
| `tool` map (custom tools) | `ctx.tool.transform((editor) => editor.add(...))` |
| returned `dispose()` | cleanup function returned by `setup` |
| `experimental.chat.system.transform` | `ctx.session.hook("context", ...)` |

Full migration guide: https://opencode.ai/v2/docs/build/plugins/migrate-v1

## Repository structure

```
opencode-plugin-template-dual-v2/
  templates/
    plugin-dual-to-v2.ts
    converge.mjs
  tests/
    template.test.ts
  specs/          # SDD artifacts (spec, plan, tasks, review)
  .opencode/      # constitution + steering
  package.json
  tsconfig.json
  README.md
```

## Testing

```sh
npm install
npm run typecheck
npm test
```

## License

MIT

## References

- OpenCode plugin docs: https://opencode.ai/v2/docs/plugins/
- Migration guide: https://opencode.ai/v2/docs/build/plugins/migrate-v1
- awesome-opencode: https://github.com/awesome-opencode/awesome-opencode
