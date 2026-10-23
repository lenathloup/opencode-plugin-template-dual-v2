# Steering: plugins-opencode

## Product

### Purpose
Provide V2-native OpenCode plugins derived from opencode-sdd-integrity, packaged for npm, local `.opencode/plugins/`, and directory formats, plus a reusable dual-to-V2 plugin template that lets any plugin converge to V2-only.

### Users
- Primary: OpenCode V2 users adopting SDD workflow plugins
- Secondary: Plugin authors migrating from V1 to V2
- Stakeholders: OpenCode community, awesome-opencode maintainers

### Success Metrics
- Plugins load in OpenCode V2 without errors
- Template supports both V2 `setup` and V1 `server` during migration, and V2-only after removing `server`
- Published to npm and listed in awesome-opencode

### Boundaries
- In scope: V2 plugins, dual-to-V2 template, npm packaging, awesome-opencode listing
- Out of scope: V1-only plugins, code generation, CI/CD pipelines, project-specific templates

### Assumptions
- OpenCode V2 installed and configured
- Node >= 22
- Users familiar with TypeScript and npm

## Tech

### Stack
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | TypeScript | 6.x | Native OpenCode plugin support |
| Runtime | @opencode/plugin | 2.x | V2 plugin contract (Plugin.define / setup) |
| Compat | @opencode-ai/plugin | 1.x | Optional dual V1 support during migration |
| Validation | Zod | 4.x | Runtime schema validation |

### Architecture Decisions
- ADR-001: Plugins are V2-native by default (Article VII)
- ADR-002: Dual support via single default export with `setup` (V2) + `server` (V1)
- ADR-003: Template is the single source of truth for plugin shape (Article VIII)
- ADR-004: Convergence to V2-only is removal of `server` export + V1 import

### Constraints
- Compatibility: V2 primary; V1 optional during migration window
- Portability: node: prefixed imports for cross-platform

### Dependencies
| Dependency | Version | Purpose |
|------------|---------|---------|
| @opencode/plugin | 2.x | V2 plugin SDK |
| @opencode-ai/plugin | 1.x | Optional V1 compat |
| zod | 4.x | Schema validation |

## Structure

### Repository Layout
```
plugins-opencode/
  plugins/              V2 plugin source (one file per plugin)
  templates/            dual-to-V2 plugin template
  tests/                Integration tests (real runtime)
  specs/                Feature specifications
  .opencode/
    spec-memory/        Constitution, steering, session state
```

### Code Conventions
- Naming: kebab-case files, PascalCase types
- Imports: node: prefix for builtins, relative for project modules
- Plugin shape: single default export with id, setup (V2), optional server (V1)

### Patterns
- Plugin pattern: `export default { id, async setup(ctx), server? }`
- Template pattern: scaffolded plugin with V2 setup + V1 server + migration notes
- Test pattern: integration tests against real OpenCode V2 runtime
