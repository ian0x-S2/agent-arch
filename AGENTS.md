# agent-arch

CLI to generate structured architecture policies for AI coding agents.
Focused on frontend (Svelte 5) with zero boilerplate scaffolding.

## Architecture

**UI (Ink)** → **Core (Pure)** → **FileWriter**

- `TemplateRegistry`: Loads patterns (FSD, Modular, etc.)
- `PolicyComposer`: Merges user choices + base fragments
- `MarkdownRenderer`: Transforms policy object to readable instructions
- `TokenEstimator`: Provides prompt usage context

## Commands

- `init`: Interactive wizard to build `policy.md`
- `generate`: Direct flag-based generation
- `validate [path]`: Ensure policy matches internal schema
- `render <id>`: Preview a pattern in the console
- `estimate [path]`: Check token count for LLM efficiency

## Data Flow

`UserSelections` → `PolicyObject` → `policy.md`

## Folder Structure

```
src/
├── core/       # Pure logic (registry, composer, renderer)
├── ui/         # Ink components and wizard state
├── commands/   # CLI entry points
├── schema/     # Valibot policy definitions
└── bin.ts      # Main router
```

## Contract

Generated `policy.md` is the **Source of Truth** for AI Agents. 
It defines declarative constraints, directory structures, and naming rules.
