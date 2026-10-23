#!/usr/bin/env node
// Converges a dual V1+V2 plugin file to V2-only.
// Usage: node converge.mjs <file> [--in-place] [--out <path>]
// Removes the @opencode-ai/plugin import, the v1Plugin const, and the
// `server` property, writing a .v2.ts sibling (or in-place with --in-place).

import { readFileSync, writeFileSync } from "node:fs"

const args = process.argv.slice(2)
const inPlace = args.includes("--in-place")
const outIdx = args.indexOf("--out")
const outPath = outIdx !== -1 ? args[outIdx + 1] : null
const positional = args.filter((a, i) => {
  if (a === "--in-place") return false
  if (a === "--out") return false
  if (outIdx !== -1 && i === outIdx + 1) return false
  return true
})
const inputPath = positional[0]

if (!inputPath) {
  console.error("Usage: node converge.mjs <file> [--in-place] [--out <path>]")
  process.exit(1)
}
if (outIdx !== -1 && !outPath) {
  console.error("Error: --out requires a value")
  process.exit(1)
}

let src
try {
  src = readFileSync(inputPath, "utf-8")
} catch (err) {
  console.error("Error: cannot read file: " + inputPath)
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}

const hadV1Import = /@opencode-ai\/plugin/.test(src)
const hadServer = /\bserver\s*:/.test(src)
const hadV1Const = /\bconst\s+v1Plugin\b/.test(src)

if (!hadV1Import && !hadServer && !hadV1Const) {
  console.log("already V2-only: no V1 markers found")
  process.exit(0)
}

// Remove import lines that reference @opencode-ai/plugin.
function removeV1Import(source) {
  return source
    .split(/\r?\n/)
    .filter((line) => !/@opencode-ai\/plugin/.test(line))
    .join("\n")
}

// Remove a top-level `const <name> = ...;` statement, tracking brace/paren/
// bracket depth and string/comment state so nested blocks are handled.
function removeTopLevelConst(source, name) {
  const re = new RegExp("\\bconst\\s+" + name + "\\b")
  const idx = source.search(re)
  if (idx === -1) return source

  let depth = 0
  let inStr = null
  let inLine = false
  let inBlock = false
  let end = -1
  for (let j = idx; j < source.length; j++) {
    const c = source[j]
    const next = source[j + 1]
    if (inLine) {
      if (c === "\n") inLine = false
      continue
    }
    if (inBlock) {
      if (c === "*" && next === "/") {
        inBlock = false
        j++
      }
      continue
    }
    if (inStr) {
      if (inStr === "`") {
        if (c === "\\") {
          j++
          continue
        }
        if (c === "`") inStr = null
      } else {
        if (c === "\\") {
          j++
          continue
        }
        if (c === inStr) inStr = null
      }
      continue
    }
    if (c === "/" && next === "/") {
      inLine = true
      continue
    }
    if (c === "/" && next === "*") {
      inBlock = true
      j++
      continue
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c
      continue
    }
    if (c === "{" || c === "(" || c === "[") {
      depth++
      continue
    }
    if (c === "}" || c === ")" || c === "]") {
      depth--
      if (c === "}" && depth === 0) {
        let k = j + 1
        while (k < source.length && (source[k] === " " || source[k] === "\t")) k++
        if (k >= source.length) {
          end = j
          break
        }
        if (source[k] === "\n" || source[k] === "\r") {
          let k2 = k
          while (k2 < source.length && (source[k2] === "\n" || source[k2] === "\r")) k2++
          if (k2 >= source.length) {
            end = j
            break
          }
          const rest = source.slice(k2)
          if (!/^,/.test(rest)) {
            end = j
            break
          }
        }
      }
      continue
    }
    if (c === ";" && depth === 0) {
      end = j
      break
    }
  }
  if (end === -1) return source

  let tail = end + 1
  while (tail < source.length && (source[tail] === "\n" || source[tail] === "\r" || source[tail] === " ")) {
    tail++
  }
  return source.slice(0, idx) + "\n" + source.slice(tail)
}

// Remove the `server: <ident>` property (with optional trailing comma).
function removeServerProperty(source) {
  let result = source.replace(/\n[ \t]*server:\s*[A-Za-z_][\w]*\s*,?[ \t]*\n/g, "\n")
  result = result.replace(/,\s*server:\s*[A-Za-z_][\w]*\s*/g, "")
  result = result.replace(/server:\s*[A-Za-z_][\w]*\s*,\s*/g, "")
  return result
}

let out = removeV1Import(src)
out = removeTopLevelConst(out, "v1Plugin")
out = removeServerProperty(out)

// Collapse 3+ blank lines to 2.
out = out.replace(/\n{3,}/g, "\n\n")

const target = inPlace
  ? inputPath
  : outPath || inputPath.replace(/\.ts$/, ".v2.ts")

try {
  writeFileSync(target, out, "utf-8")
} catch (err) {
  console.error("Error: cannot write file: " + target)
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
}

console.log("converged: wrote " + target)
console.log("removed: V1 import=" + hadV1Import + ", v1Plugin const=" + hadV1Const + ", server property=" + hadServer)
