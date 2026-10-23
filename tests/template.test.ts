import { describe, it, expect } from "vitest"
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"

import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, "..")
const TEMPLATE = join(ROOT, "templates", "plugin-dual-to-v2.ts")
const CONVERGE = join(ROOT, "templates", "converge.mjs")

describe("dual-to-V2 plugin template", () => {
  it("template file exists and declares the dual shape", () => {
    const content = readFileSync(TEMPLATE, "utf-8")
    expect(content.length).toBeGreaterThan(0)
    expect(content).toContain('id: "opencode-plugin-template-dual-v2"')
    expect(content).toContain("async setup(ctx")
    expect(content).toContain("server: v1Plugin")
    expect(content).toContain('ctx.tool.hook("execute.before"')
    expect(content).toContain('ctx.tool.hook("execute.after"')
    expect(content).toContain("ctx.tool.transform")
    expect(content).toContain("@opencode/plugin")
    expect(content).toContain("@opencode-ai/plugin")
  })

  it("template stays under 250 lines (simplicity)", () => {
    const content = readFileSync(TEMPLATE, "utf-8")
    const lines = content.split(/\r?\n/).length
    expect(lines).toBeLessThanOrEqual(250)
  })

  it("template uses node: prefixed imports only for builtins", () => {
    const content = readFileSync(TEMPLATE, "utf-8")
    // no bare node builtins without node: prefix
    expect(content).not.toMatch(/from\s+["']fs["']/)
    expect(content).not.toMatch(/from\s+["']path["']/)
  })

  it("convergence script converts a dual file to V2-only", () => {
    const dir = mkdtempSync(join(tmpdir(), "converge-"))
    try {
      const input = join(dir, "sample.ts")
      const templateContent = readFileSync(TEMPLATE, "utf-8")
      writeFileSync(input, templateContent, "utf-8")

      const result = spawnSync(process.execPath, [CONVERGE, input], {
        encoding: "utf-8",
      })
      expect(result.status).toBe(0)
      expect(result.stdout).toContain("converged:")

      const output = readFileSync(input.replace(/\.ts$/, ".v2.ts"), "utf-8")
      expect(output).not.toMatch(/@opencode-ai\/plugin/)
      expect(output).not.toMatch(/\bconst\s+v1Plugin\b/)
      expect(output).not.toMatch(/\bserver\s*:/)
      expect(output).toContain("async setup(ctx")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("convergence script is idempotent on an already V2-only file", () => {
    const dir = mkdtempSync(join(tmpdir(), "converge-"))
    try {
      const input = join(dir, "already-v2.ts")
      const v2Only = [
        'import type { Plugin as V2Plugin } from "@opencode/plugin"',
        'import { z } from "zod"',
        "",
        "export default {",
        '  id: "x",',
        "  async setup(ctx) {",
        "    await ctx.tool.hook(\"execute.before\", async () => {})",
        "  },",
        "}",
        "",
      ].join("\n")
      writeFileSync(input, v2Only, "utf-8")

      const result = spawnSync(process.execPath, [CONVERGE, input], {
        encoding: "utf-8",
      })
      expect(result.status).toBe(0)
      expect(result.stdout).toContain("already V2-only")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("convergence script supports --in-place", () => {
    const dir = mkdtempSync(join(tmpdir(), "converge-"))
    try {
      const input = join(dir, "inplace.ts")
      const templateContent = readFileSync(TEMPLATE, "utf-8")
      writeFileSync(input, templateContent, "utf-8")

      const result = spawnSync(process.execPath, [CONVERGE, input, "--in-place"], {
        encoding: "utf-8",
      })
      expect(result.status).toBe(0)

      const output = readFileSync(input, "utf-8")
      expect(output).not.toMatch(/@opencode-ai\/plugin/)
      expect(output).not.toMatch(/\bserver\s*:/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("convergence script fails cleanly on missing file", () => {
    const result = spawnSync(process.execPath, [CONVERGE, "/no/such/file.ts"], {
      encoding: "utf-8",
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain("Error: cannot read file")
  })
})
