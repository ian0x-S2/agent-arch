# Architecture Policy

Pattern: flat | Framework: Svelte 5 | Styling: utility-first

## Structure

No enforced layers — intentional simplicity at this scale.

- Circular imports: FORBIDDEN
- Cross imports: allowed

## Directory Structure

src/
├── components/ # all components — logic colocated ok at this scale
├── hooks/ # reusable reactive logic (.svelte.ts)
├── services/ # server-only external I/O — consumed via load functions only
├── types/ # shared types
└── utils/ # pure functions

> Graduation signals — migrate to modular when:
>
> - > 20 components in /components
> - same data fetched in 3+ places
> - repeated business logic across 3+ components

## File Conventions

| Type      | File            | Export          |
| --------- | --------------- | --------------- |
| component | \*.svelte       | PascalCase      |
| hook      | \*.svelte.ts    | camelCase       |
| service   | \*.ts           | camelCase       |
| types     | \*.types.ts     | PascalCase      |
| constants | \*.constants.ts | SCREAMING_SNAKE |
| utils     | \*.ts           | camelCase       |

- Naming: kebab-case for files
- Barrel exports: optional
- No default exports on utilities

## Component Rules

- No direct service imports in components — data via load functions only
- Extract to \*.svelte.ts when script > 25 lines or logic repeats across 2+ components
- Extract to new component when template has > 2 logical sections
- Max props: 10 | No prop drilling beyond depth 3

## Svelte 5 Runes

- $state → local reactive state
- $derived → computed values (never $effect for derived state)
- $effect → side effects only (DOM, subscriptions)
- $props → component interface
- $bindable → explicit two-way binding (use sparingly)
- No legacy stores for local state

## Data Flow

route (load fn) → services (server-only) → UI

- Services consumed through +page.server.ts only
- API errors must be mapped to domain types before reaching UI
- Every async operation requires loading + error state

## Forbidden

- Circular imports
- Direct service imports in components
- Service imports in +page.ts (server-only)
- `any` type (use unknown + narrowing)
- Type assertions (`as`) except at data boundaries
