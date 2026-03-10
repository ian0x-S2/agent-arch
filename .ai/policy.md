# Architecture Policy
Pattern: feature-sliced | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
app → features → entities → shared (unidirectional, strict)

| Layer    | May Import          |
|----------|---------------------|
| app      | features, entities, shared |
| features | entities, shared    |
| entities | shared              |
| shared   | —                   |

- Cross-feature imports: FORBIDDEN
- Circular imports: FORBIDDEN
- Cross-slice imports must go through index.ts

## Directory Structure
src/
├── routes/          # load functions, actions — no domain logic
├── app/             # providers, router, global styles
├── features/<slice>/
│   ├── ui/          # components
│   ├── api/         # external I/O and API clients — called by load functions
│   └── index.ts     # public API (required)
├── entities/<slice>/
│   ├── model/       # domain logic, validators, value objects (no reactive state)
│   ├── api/         # data access, response mapping
│   └── index.ts     # public API (required)
└── shared/
    ├── ui-kit/      # primitives
    ├── api/         # base fetch only — no domain requests
    ├── lib/         # pure utils
    └── types/       # global types

## File Conventions
| Type      | File             | Export          |
|-----------|------------------|-----------------|
| component | *.svelte         | PascalCase      |
| logic     | *.svelte.ts      | camelCase       |
| service   | *.service.ts     | camelCase       |
| types     | *.types.ts       | PascalCase      |
| constants | *.constants.ts   | SCREAMING_SNAKE |

- Naming: kebab-case for files
- Barrel exports: required only at feature/entity roots (index.ts)
- No default exports on utilities

## Component Rules
- No data fetching in components — receive via props/load
- No business logic in components
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
- Extract to new component when template has > 2 logical sections
- Max props: 10 | No prop drilling beyond depth 2
- Prefer composition over configuration (slots over boolean props)

## Svelte 5 Runes
- $state → local reactive state
- $derived → computed values (never $effect for derived state)
- $effect → side effects only (DOM, subscriptions)
- $props → component interface
- $bindable → explicit two-way binding (use sparingly)
- No legacy stores for local state

## State & Data Flow
route (load fn) → features/api (use case) → entities/api (data access) → entities/model (domain type)

- Side effects: allowed only in features/api and entities/api
- API errors must be mapped to domain types before reaching UI
- Every async operation requires loading + error state

## Forbidden
- Component fetching data directly
- Reactive state ($state) in entities
- Domain logic in features/api
- Raw API responses leaking to UI
- any type (use unknown + narrowing)
- Type assertions (as) except at data boundaries