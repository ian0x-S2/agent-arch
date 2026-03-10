# agent-arch

CLI to generate structured architecture policies for AI coding agents.
**Scope:** Svelte 5 (frontend only). **No scaffolding.**

## Stack

- **Runtime:** Bun + TypeScript
- **UI:** React Ink (CLI)
- **Routing:** Commander
- **Validation:** Valibot

## Core Principles

1. **Policy First:** `policy.md` is the official interface for AI agents.
2. **Pure Core:** Logic (Composer, Renderer) must remain pure; no I/O outside `Writer`.
3. **Declarative:** Constraints are defined in patterns and merged by the composer.

## Architecture

**UI (Ink)** → **State (Wizard)** → **Core (Composer)** → **Markdown (Renderer)** → **File (Writer)**

### Core Modules

- `TemplateRegistry`: Managed repository for base patterns (FSD, Flat, Atomic, etc.)
- `PolicyComposer`: Core logic merging base + fragments → `PolicyObject`.
- `MarkdownRenderer`: Transforms `PolicyObject` into structured, agent-readable MD.
- `TokenEstimator`: Simple heuristic to calculate token cost.

## Structure

```bash
src/
├── bin.ts        # CLI Entry point
├── commands/     # Command actions (init, generate, validate, etc.)
├── core/         # Pure logic: registry, composer, renderer, token
├── schema/       # Valibot schemas (source of truth for policy structure)
└── ui/           # Wizard screens and Ink components
```

## Matrix (FSD Default)

`ui → hooks → state → services → types`
- Circular imports: **FORBIDDEN**
- Cross-feature: **via public-api (index.ts) only**
