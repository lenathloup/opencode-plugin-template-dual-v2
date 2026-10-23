# Project Constitution

> Governing principles for plugins-opencode

## Article I: Simplicity First

Every feature must be built with minimal dependencies. Max 3 top-level projects. No abstraction without immediate need.

Why: Models pattern-match against millions of codebases and tend to over-engineer. Simplicity constraints counter this bias. Explicit limits force deliberate decisions rather than automatic complexity.

## Article II: Test-First Imperative (NON-NEGOTIABLE)

Tests must be written before implementation code. Every user story requires at minimum one integration test covering the happy path.

Why: Writing tests after code lets the agent optimize for false positives. Tests written first define real acceptance criteria. Integration tests catch the systemic failures that unit tests miss in AI-generated code.

## Article III: Explicit Over Implicit

Configuration is explicit. Auto-discovery is permitted when visible and confirmed by the user before use. No hidden global state. Dependencies are injected, not imported.

Why: AI agents default to implicit patterns (auto-loading, ambient singletons) because training data favors brevity. Explicit configuration makes decisions visible, auditable, and reversible.

## Article IV: Integration-First Testing

Tests run against real dependencies (database, API, filesystem) not mocks. Use testcontainers or equivalent for external services.

Why: Mock-heavy tests pass on AI-generated code but fail in production. Real dependencies catch integration bugs that mocks hide.

## Article V: Quality Gates

- Lint must pass before commit
- Tests must pass before merge
- No dead code, no commented-out code, no TODOs in main

## Article VI: Documentation as Code

Specs, plans, and decisions live in the repository alongside code. Update docs when behavior changes.

## Article VII: V2-Native by Default (project-specific)

Plugins target OpenCode V2 (`@opencode/plugin`, `Plugin.define` / `setup(ctx)`). Dual V1+V2 support is permitted only as a temporary migration aid and must be removable without changing the V2 behavior. No V1-only code ships in main.

Why: V1 plugin implementations do not run in V2. Keeping V1 as the primary path would make the plugins unusable on V2. The migration guide (opencode.ai/v2/docs/build/plugins/migrate-v1) defines the V2 contract.

## Article VIII: Template Convergence (project-specific)

Every plugin must be derivable from the dual-to-V2 template. The template is the single source of truth for plugin shape. Convergence to V2-only is a documented, tested, one-step removal of the `server` (V1) export.

---

### Project-specific notes

- Simplicity: max 3 top-level projects (plugins, templates, tests)
- Test approach: vitest + real filesystem (integration-first)
- Explicit config: opencode.json(c) `plugins` array, V2 shape
- Integration tests: run against real OpenCode V2 runtime where possible
- Quality tools: tsc --noEmit, vitest, lint:lang
- Docs: README + specs/ + steering
