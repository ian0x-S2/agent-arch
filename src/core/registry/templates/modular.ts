import type { Policy } from '../../../schema/policy.schema';

export const MODULAR_LOAD_MODE = `# Architecture Policy
Pattern: modular | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
modules → shared (unidirectional, strict)

| Layer   | May Import |
|---------|------------|
| modules | shared     |
| shared  | —          |

- Cross-module imports: FORBIDDEN — modules must remain isolated
- Circular imports: FORBIDDEN
- shared must contain only infrastructure (utils, design system, global types)

## Directory Structure
src/
├── modules/<slice>/
│   ├── components/  # components — no logic, extract when template > 2 logical sections
│   ├── hooks/       # module-scoped reactive state and logic (.svelte.ts)
│   ├── services/    # external I/O only — $env/static/private allowed here only
│   ├── types/       # module-scoped types
│   └── index.ts     # public API (required)
└── shared/
    ├── ui/          # design system primitives
    ├── utils/       # pure functions — min 2 consumers to justify
    └── types/       # global types only

## File Conventions
| Type      | File           | Export          |
|-----------|----------------|-----------------|
| component | *.svelte       | PascalCase      |
| hook      | *.svelte.ts    | camelCase       |
| service   | *.ts           | camelCase       |
| types     | *.types.ts     | PascalCase      |
| constants | *.constants.ts | SCREAMING_SNAKE |

- Naming: kebab-case for files
- Barrel exports: required only at module roots (index.ts)
- No default exports on utilities

## Component Rules
- No business logic in components
- No direct service imports in components — data via load functions only
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

## Data Flow
route (load fn) → modules/services → UI

- Services are server-only — consumed through +page.server.ts, never imported in components
- API errors must be mapped to domain types before reaching UI
- Every async operation requires loading + error state

## Forbidden
- Cross-module imports
- Direct service imports in components
- Business logic in shared
- Domain logic or module coordination in shared
- Global reactive state outside module hooks
- \`any\` type (use unknown + narrowing)
- Type assertions (\`as\`) except at data boundaries`;

export const MODULAR_REMOTE_MODE = `# Architecture Policy
Pattern: modular | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
modules → shared (unidirectional, strict)

| Layer   | May Import |
|---------|------------|
| modules | shared     |
| shared  | —          |

- Cross-module imports: FORBIDDEN — modules must remain isolated
- Circular imports: FORBIDDEN
- shared must contain only infrastructure (utils, design system, global types)

## Directory Structure
src/
├── modules/<slice>/
│   ├── components/  # components — no logic, extract when template > 2 logical sections
│   ├── hooks/       # reactive state and logic (.svelte.ts)
│   ├── server/      # *.remote.ts — server-side use cases
│   ├── types/       # module-scoped types
│   └── index.ts     # public API (required)
└── shared/
    ├── ui/          # design system primitives
    ├── utils/       # pure functions — min 2 consumers to justify
    └── types/       # global types only

## File Conventions
| Type            | File           | Export          |
|-----------------|----------------|-----------------|
| component       | *.svelte       | PascalCase      |
| hook            | *.svelte.ts    | camelCase       |
| remote function | *.remote.ts    | camelCase       |
| types           | *.types.ts     | PascalCase      |
| constants       | *.constants.ts | SCREAMING_SNAKE |

- Naming: kebab-case for files
- Barrel exports: required only at module roots (index.ts)
- No default exports on utilities

## Component Rules
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

## Module Model Rules
- module-scoped reactive state only
- must not store domain data directly (no $state<User[]> as client cache)
- derive display state from remote function responses, do not mirror server state

## Data Flow
\`\`\`
component | hook → modules/server (*.remote.ts) → UI
\`\`\`

- Remote functions may only be called from components or hook modules
- Remote functions are the only entry point to server-side logic
- Remote functions are the only place allowed to access server-only modules (env vars, db clients)
- Prefer aggregating multiple data needs into a single remote function over cascading calls
- API errors must be mapped to domain types before returning to the component
- Every async call in a component requires loading + error state

## Forbidden
- Cross-module imports
- Calling remote functions from shared
- Business logic in shared
- Domain logic or module coordination in shared
- Cascading remote calls from a single component (aggregate instead)
- Global reactive state outside module hooks
- \`any\` type (use unknown + narrowing)
- Type assertions (\`as\`) except at data boundaries`;

export const modularTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "modular",
    "state_philosophy": "module-based",
    "styling_strategy": "any",
    framework: 'svelte',

    "component_lib": undefined
  },
  "layers": [
    {
      "id": "modules",
      "allowed_imports": ["shared"],
      "responsibilities": {
        "owns": ["business logic", "components", "hooks", "services"],
        "must_not": ["import directly from other modules"],
        "depends_on_abstractions": true
      }
    },
    {
      "id": "shared",
      "allowed_imports": [],
      "responsibilities": {
        "owns": ["design system", "utils", "global types", "api client"],
        "must_not": ["contain business logic", "import from modules"],
        "depends_on_abstractions": false
      }
    }
  ],
  "import_matrix": {
    "modules": ["shared"],
    "shared": []
  },
  "structural_constraints": {
    "max_component_depth": 4,
    "barrel_exports_required": true,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "via-public-api-only"
  },
  "cross_module_communication": "via-shared-only",
  "ui_constraints": {
    "component_max_props": 7,
    "prop_drilling_max_depth": 2,
    "logic_in_components": false,
    "style_co_location": true,
    "allowed_style_extensions": [".css", ".module.css"],
    "prefer_composition": true
  },
  "state_constraints": {
    "global_state_scope": "module-based",
    "local_state_allowed": true,
    "derived_state_strategy": "selectors",
    "forbidden_patterns": ["direct-mutation"]
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["modules", "shared"],
    "forbidden_in_layers": [],
    "async_pattern": "async-await",
    "data_fetching_scope": "modules"
  },
  "naming_conventions": {
    "global_strategy": "PascalCase",
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
        "pattern": "*.ts",
        "companions": {
          "style": { "required": false, "extensions": [".css", ".module.css"] },
          "test": { "required": true, "extensions": [".test.ts"] }
        }
      },
      "hook": {
        "pattern": "use*.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "store": {
        "pattern": "*.store.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "service": {
        "pattern": "*.service.ts",
        "companions": {
          "test": { "required": false, "extensions": [".test.ts"] }
        }
      },
      "types": {
        "pattern": "*.types.ts"
      },
      "constants": {
        "pattern": "*.constants.ts"
      }
    },
    "colocation": "strict",
    "public_api": {
      "required": true,
      "expose_internals": false
    },
    "test_placement": "colocated",
    "forbidden_patterns": [
      "default-export-on-utility",
      "barrel-in-non-feature-root"
    ]
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};
