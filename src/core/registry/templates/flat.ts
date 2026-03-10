import type { Policy } from '../../../schema/policy.schema';

export const FLAT_LOAD_MODE = `# Architecture Policy
Pattern: flat | Framework: Svelte 5 | Styling: utility-first

## Structure
No enforced layers — intentional simplicity at this scale.

- Circular imports: FORBIDDEN
- Cross imports: allowed

## Directory Structure
src/
├── components/  # all components — logic colocated ok at this scale
├── hooks/       # reusable reactive logic (.svelte.ts)
├── services/    # external I/O and API clients — consumed via load functions only
├── types/       # shared types
└── utils/       # pure functions

> Graduation signals — migrate to modular when:
> - > 20 components in /components
> - same data fetched in 3+ places
> - repeated business logic across 3+ components

## File Conventions
| Type      | File             | Export          |
|-----------|------------------|-----------------|
| component | *.svelte         | PascalCase      |
| hook      | *.svelte.ts      | camelCase       |
| service   | *.ts             | camelCase       |
| types     | *.types.ts       | PascalCase      |
| constants | *.constants.ts   | SCREAMING_SNAKE |
| utils     | *.ts             | camelCase       |

- Naming: kebab-case for files
- inline magic numbers — extract to named constants (*.constants.ts)
- errors must be typed — no throwing raw strings
- boolean variables must use is/has/can prefix
- Barrel exports: optional
- No default exports on utilities

## Component Rules
- No direct service imports in components — data via load functions only
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
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
- \`any\` type (use unknown + narrowing)
- Type assertions (\`as\`) except at data boundaries`;

export const FLAT_REMOTE_MODE = `# Architecture Policy
Pattern: flat | Framework: Svelte 5 | Styling: utility-first

## Structure
No enforced layers — intentional simplicity at this scale.

- Circular imports: FORBIDDEN
- Cross imports: allowed

## Directory Structure
src/
├── components/  # all components — logic colocated ok at this scale
├── hooks/       # reusable reactive logic (.svelte.ts)
├── server/      # *.remote.ts — server-only use cases
├── types/       # shared types
└── utils/       # pure functions

> Graduation signals — migrate to modular when:
> - > 20 components in /components
> - same data fetched in 3+ places
> - repeated business logic across 3+ components

## File Conventions
| Type            | File           | Export          |
|-----------------|----------------|-----------------|
| component       | *.svelte       | PascalCase      |
| hook            | *.svelte.ts    | camelCase       |
| remote function | *.remote.ts    | camelCase       |
| types           | *.types.ts     | PascalCase      |
| constants       | *.constants.ts | SCREAMING_SNAKE |
| utils           | *.ts           | camelCase       |

- Naming: kebab-case for files
- inline magic numbers — extract to named constants (*.constants.ts)
- errors must be typed — no throwing raw strings
- boolean variables must use is/has/can prefix
- Barrel exports: optional
- No default exports on utilities

## Component Rules
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
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
component | hook → server (*.remote.ts) → UI

- Remote functions may only be called from components or hooks
- Remote functions are the only place allowed to access server-only modules (env vars, db clients)
- Prefer aggregating multiple data needs into a single remote function over cascading calls
- API errors must be mapped to domain types before returning to the component
- Every async call in a component requires loading + error state

## Forbidden
- Circular imports
- Calling remote functions from utils
- Cascading remote calls from a single component (aggregate instead)
- \`any\` type (use unknown + narrowing)
- Type assertions (\`as\`) except at data boundaries`;

export const flatTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "flat",
    "state_philosophy": "flexible",
    "styling_strategy": "any",
    framework: 'svelte',

    "component_lib": undefined
  },
  "layers": [],
  "import_matrix": {},
  "structural_constraints": {
    "max_component_depth": 5,
    "barrel_exports_required": false,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "allowed"
  },
  "ui_constraints": {
    "component_max_props": 10,
    "prop_drilling_max_depth": 3,
    "logic_in_components": true,
    "style_co_location": true,
    "allowed_style_extensions": [".css", ".module.css"],
    "prefer_composition": true
  },
  "state_constraints": {
    "global_state_scope": "any",
    "local_state_allowed": true,
    "derived_state_strategy": "any",
    "forbidden_patterns": ["direct-mutation"]
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["any"],
    "forbidden_in_layers": [],
    "async_pattern": "async-await",
    "data_fetching_scope": "any"
  },
  "naming_conventions": {
    "global_strategy": "kebab-case",
    "component": "PascalCase",
    "hook": "camelCase",
    "store": "camelCase",
    "service": "camelCase",
    "type": "PascalCase",
    "constant": "SCREAMING_SNAKE_CASE"
  },
  "file_conventions": {
    "types": {
      "component": {
        "pattern": "*.svelte",
        "companions": {
          "style": { "required": false, "extensions": [".css", ".module.css"] },
          "test": { "required": false, "extensions": [".test.ts"] }
        }
      },
      "hook": {
        "pattern": "*.svelte.ts"
      },
      "types": {
        "pattern": "*.types.ts"
      },
      "constants": {
        "pattern": "*.constants.ts"
      }
    },
    "colocation": "loose",
    "public_api": {
      "required": false,
      "expose_internals": true
    },
    "test_placement": "colocated",
    "forbidden_patterns": []
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};
