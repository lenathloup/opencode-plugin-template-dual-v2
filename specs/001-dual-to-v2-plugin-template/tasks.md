# Tasks: Dual-to-V2 Plugin Template

**Feature**: 001-dual-to-v2-plugin-template

## Phase 1: Template

- [ ] T1: Create templates/plugin-dual-to-v2.ts with dual V1+V2 shape
  - _Depends_: none
  - Done: file exists, default export { id, async setup(ctx), server }, V2 hooks + custom tool via ctx.tool.transform, V1 server returning string-keyed hooks, convergence comments, node: imports, under 250 lines
- [ ] T2: Create templates/converge.mjs
  - _Depends_: T1
  - Done: script reads input path from argv, detects V1 markers, removes them idempotently, prints "already V2-only" when absent, writes .v2.ts (or in-place with --in-place)

## Phase 2: Tests

- [ ] T3: Create tests/template.test.ts
  - _Depends_: T1, T2
  - Done: V2 load (mock ctx) registers hook + custom tool; convergence produces V2-only file; convergence on V2-only file no-ops

## Phase 3: Review

- [ ] T4: Run cross-artifact consistency review (spec/plan/tasks/constitution)
  - _Depends_: T3
  - Done: review report with no HIGH findings
- [ ] T5: Approve spec, plan, tasks (update spec.json approvals)
  - _Depends_: T4
  - Done: spec.json approvals all true, ready_for_implementation true

## Dependencies

T1 -> T2 -> T3 -> T4 -> T5

## Boundary Annotations

- _Boundary: templates/_ - template and script only
- _Boundary: tests/_ - tests only, no production code
- _Boundary: specs/_ - artifacts only, no code
