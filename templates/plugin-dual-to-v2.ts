// Template: dual V1+V2 OpenCode plugin.
// Copy this file into your plugin directory and rename it.
// V2 is the primary target. V1 (server) is kept for migration and can be
// removed in one step with templates/converge.mjs.

import type { Plugin as V1Plugin } from "@opencode-ai/plugin"
import type { Plugin as V2Plugin } from "@opencode/plugin"
import { z } from "zod"

// --- Shared helpers (framework-agnostic) ---

export type TemplateOptions = {
  enabled?: boolean
  greeting?: string
}

export function parseOptions(raw: unknown): TemplateOptions {
  const source = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {}
  return {
    enabled: source.enabled === false ? false : true,
    greeting: typeof source.greeting === "string" ? source.greeting : "Hello",
  }
}

// --- V1 implementation (legacy, kept during migration) ---

const v1Plugin: V1Plugin = async (input, options) => {
  const opts = parseOptions(options)
  if (!opts.enabled) return {}

  return {
    "tool.execute.before": async (toolInput, toolOutput) => {
      // V1 hook: "tool.execute.before"
      // V2 equivalent: ctx.tool.hook("execute.before", ...)
      if (toolInput?.tool === "template_hello") {
        // example: log before running the custom tool
      }
    },

    "tool.execute.after": async (toolInput, toolOutput) => {
      // V1 hook: "tool.execute.after"
      // V2 equivalent: ctx.tool.hook("execute.after", ...)
    },

    tool: {
      template_hello: {
        description: "Returns a greeting for the given name (template example).",
        args: {
          name: z.string().describe("Name to greet"),
        },
        async execute(args: { name: string }) {
          return `${opts.greeting}, ${args.name}!`
        },
      },
    },
  }
}

// --- V2 implementation (primary) ---

export default {
  id: "opencode-plugin-template-dual-v2",

  async setup(ctx: V2Plugin.Context): Promise<void> {
    const opts = parseOptions(ctx.options)
    if (!opts.enabled) return

    // V2 hook registration (replaces V1 string-keyed hooks).
    await ctx.tool.hook("execute.before", async (event) => {
      // V2 equivalent of V1 "tool.execute.before"
      if (event.tool === "template_hello") {
        // example: log before running the custom tool
      }
    })

    await ctx.tool.hook("execute.after", async (event) => {
      // V2 equivalent of V1 "tool.execute.after"
      // event.status is "completed" | "error"
    })

    // V2 custom tool registration (replaces V1 `tool` map).
    await ctx.tool.transform((editor) => {
      const argsSchema = z.object({
        name: z.string().describe("Name to greet"),
      })
      editor.add({
        name: "template_hello",
        description: "Returns a greeting for the given name (template example).",
        input: z.toJSONSchema(argsSchema) as any,
        options: { codemode: false },
        async execute(input, _context) {
          const args = argsSchema.parse(input ?? {})
          return { content: `${opts.greeting}, ${args.name}!` }
        },
      })
    })
  },

  // V1 compatibility export (remove together with the @opencode-ai/plugin import
  // above to converge to V2-only). See templates/converge.mjs.
  server: v1Plugin,
}

// --- Convergence checklist (manual fallback) ---
// 1. Remove: import type { Plugin as V1Plugin } from "@opencode-ai/plugin"
// 2. Remove: the v1Plugin const and the server property (server points at v1Plugin)
// 3. Keep: id, setup(ctx), and the @opencode/plugin import
// Or run: node templates/converge.mjs <file>
// Migration guide: https://opencode.ai/v2/docs/build/plugins/migrate-v1
