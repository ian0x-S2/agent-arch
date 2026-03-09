# Architecture Policy

Pattern: atomic | Framework: Svelte 5 | Styling: utility-first
Focus: design system

## Layers & Import Direction

organisms → molecules → atoms → shared (unidirectional, strict)

| Layer     | May Import               |
| --------- | ------------------------ |
| organisms | molecules, atoms, shared |
| molecules | atoms, shared            |
| atoms     | shared                   |
| shared    | —                        |

- Circular imports: FORBIDDEN

## Directory Structure

src/
├── organisms/<component>/
│ ├── ComponentName.svelte # complex UI sections — UI state allowed, no business logic
│ ├── hooks/ # reusable reactive logic (.svelte.ts)
│ └── types/
├── molecules/<component>/
│ ├── ComponentName.svelte # atom combinations — UI state allowed, no business logic
│ └── types/
├── atoms/<component>/
│ ├── ComponentName.svelte # single element wrappers — primitive behavior only
│ └── types/
└── shared/
├── utils/ # pure functions
├── types/ # global types
└── theme/ # Tailwind config extensions — scoped tokens via CSS vars if needed

## File Conventions

| Type      | File            | Export          |
| --------- | --------------- | --------------- |
| component | \*.svelte       | PascalCase      |
| hook      | \*.svelte.ts    | camelCase       |
| types     | \*.types.ts     | PascalCase      |
| constants | \*.constants.ts | SCREAMING_SNAKE |

- Naming: snake_case for files
- Barrel exports: required at component roots only
- No default exports on utilities

## Component Rules

- No business logic at any layer — UI state is allowed
- No data fetching at any layer
- Extract to \*.svelte.ts when script > 25 lines or logic repeats across 2+ components
- Extract to new component when template has > 2 logical sections
- Max props: 10 | No prop drilling beyond depth 3
- Prefer composition over configuration (slots over boolean props)

## Svelte 5 Runes

- $state → local reactive state
- $derived → computed values (never $effect for derived state)
- $effect → side effects only (DOM, subscriptions)
- $props → component interface
- $bindable → explicit two-way binding (use sparingly)
- No legacy stores for local state

## Forbidden

- Circular imports
- Business logic at any layer
- Data fetching at any layer
- any type (use unknown + narrowing)
- Type assertions (as) except at data boundaries
