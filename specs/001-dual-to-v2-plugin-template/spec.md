# Feature Specification: Dual-to-V2 Plugin Template

**Feature ID**: 001-dual-to-v2-plugin-template
**Status**: Draft
**Created**: 2026-10-22

## Overview

Create a reusable OpenCode plugin template that supports the dual V1+V2 shape during migration and provides an automated path to converge to V2-only. The template is the single source of truth for plugin shape in plugins-opencode (Constitution Article VIII).

## Problem Statement

opencode-sdd-integrity ships 5 plugins in a dual V1+V2 shape, but there is no canonical template that:
1. Demonstrates the dual shape with both setup (V2) and server (V1).
2. Demonstrates a custom tool registration via ctx.tool.transform.
3. Provides an automated convergence script to V2-only.
4. Documents the V1 to V2 hook mapping.

Without this template, each new plugin re-invents the shape and migration path, risking drift and V1-only leftovers.

## User Stories

### US-1 (P1): Plugin author scaffolds a new plugin from the template

As a plugin author I want a template that produces a working dual V1+V2 plugin So that I can start a new plugin without re-inventing the shape.

Acceptance Criteria:
- Given an empty directory, When I copy the template, Then the resulting plugin loads in OpenCode V2 without errors
- Given the template plugin, When loaded in OpenCode V2, Then setup(ctx) runs and registers at least one hook and one custom tool
- Given the template plugin, When loaded in OpenCode V1 (1.18.29+), Then server() runs and returns hooks

### US-2 (P1): Plugin author converges a plugin to V2-only

As a plugin author I want an automated one-step removal of V1 support So that I can drop V1 without changing V2 behavior.

Acceptance Criteria:
- Given a dual plugin, When I run the convergence script, Then the server export and V1 import are removed
- Given a dual plugin, When I run the convergence script, Then the plugin still loads in V2 with identical behavior
- Given an already V2-only plugin, When I run the convergence script, Then it no-ops with a clear message
- Given the template, When convergence is applied, Then the resulting V2-only plugin passes the same tests

### US-3 (P2): Template includes migration documentation

As a plugin author I want inline documentation of the V1 to V2 migration So that I understand the hook mapping and context changes.

Acceptance Criteria:
- Given the template file, When read, Then it contains comments mapping each V1 hook to its V2 equivalent
- Given the template file, When read, Then it references the opencode migration guide URL
- Given the template, When reviewed, Then it passes lint:lang (English only)

## Functional Requirements

- FR-1: Template must be a single TypeScript file with a default export of shape { id, async setup(ctx), server? }
- FR-2: Template must demonstrate at least one V2 hook registration (ctx.tool.hook or ctx.permission.hook or ctx.session.hook)
- FR-3: Template must demonstrate the V1 server function returning string-keyed hooks
- FR-4: Template must include a convergence checklist (comments) listing steps to remove V1
- FR-5: Template must use node: prefixed imports
- FR-6: Template must be V2-natively typed (import from @opencode/plugin)
- FR-7: Template must demonstrate registering a custom tool via ctx.tool.transform
- FR-8: Template must ship an automated convergence script that removes the server export and the V1 import, producing a V2-only file

## Non-Functional Requirements

- NFR-1: Template loads in OpenCode V2 without runtime errors
- NFR-2: Template passes TypeScript typecheck (tsc --noEmit)
- NFR-3: Template is under 250 lines (simplicity)
- NFR-4: No external runtime dependencies beyond @opencode/plugin and @opencode-ai/plugin (optional)
- NFR-5: Convergence script is idempotent and fails safely if V1 markers are absent

## Success Metrics

- Template loads successfully in OpenCode V2
- A plugin copied from the template passes integration test (happy path)
- Convergence to V2-only is a single automated step (script run)

## Edge Cases

- EC-1: Template used in a project without .opencode/ directory -> must still load (hooks no-op gracefully)
- EC-2: Template loaded with no options -> must use sensible defaults
- EC-3: V1 runtime older than 1.18.29 -> documented as unsupported (dual export requires 1.18.29+)
- EC-4: Convergence script run on an already V2-only file -> no-op with clear message

## Out of Scope

- Actual plugin implementations (perfmon, guard, etc.) - separate features
- npm publishing - separate feature
- awesome-opencode PR - separate feature

## Open Questions

(none - all clarified)
