import type { Policy } from '../../../schema/policy.schema';

export const FSD_LOAD_MODE = `# Architecture Policy
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
- Type assertions (as) except at data boundaries`;

export const FSD_REMOTE_MODE = `# Architecture Policy
Pattern: feature-sliced | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
app → features → entities → shared (unidirectional, strict)

| Layer    | May Import                 |
|----------|----------------------------|
| app      | features, entities, shared |
| features | entities, shared           |
| entities | shared                     |
| shared   | —                          |

- Cross-feature imports: FORBIDDEN
- Circular imports: FORBIDDEN
- Cross-slice imports must go through index.ts

## Directory Structure
src/
├── routes/          # composition only — no domain logic
├── app/             # providers, router, global styles
├── features/<slice>/
│   ├── ui/          # components
│   ├── model/       # feature-scoped reactive state (.svelte.ts)
│   ├── server/      # *.remote.ts — server-side use cases
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
| Type            | File           | Export          |
|-----------------|----------------|-----------------|
| component       | *.svelte       | PascalCase      |
| logic           | *.svelte.ts    | camelCase       |
| remote function | *.remote.ts    | camelCase       |
| service         | *.service.ts   | camelCase       |
| types           | *.types.ts     | PascalCase      |
| constants       | *.constants.ts | SCREAMING_SNAKE |

- Naming: kebab-case for files
- Barrel exports: required only at feature/entity roots (index.ts)
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

## Feature Model Rules
- feature-scoped reactive state only
- must not store domain entities directly (no $state<User[]> as client cache)
- derive display state from remote function responses, do not mirror server state

## Data Flow
\`\`\`
component | feature model → features/server (*.remote.ts) → entities/api → entities/model
\`\`\`

- Remote functions may only be called from components or feature model modules
- Remote functions are the only entry point to server-side logic
- Remote functions are the only place allowed to access server-only modules (env vars, db clients)
- Remote functions must call entities/api — never access the data layer directly
- Prefer aggregating multiple data needs into a single remote function over cascading calls
- API errors must be mapped to domain types before returning to the component
- Every async call in a component requires loading + error state

## Forbidden
- Calling remote functions from entities or shared
- Domain logic in features/server
- Reactive state ($state) in entities
- Raw API responses leaking to UI
- Cascading remote calls from a single component (aggregate instead)
- \`any\` type (use unknown + narrowing)
- Type assertions (\`as\`) except at data boundaries`;

export const featureSlicedTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "feature-sliced",
    "state_philosophy": "feature-based",
    "styling_strategy": "utility-first",
    framework: 'svelte',

    "component_lib": undefined
  },
  "fsd_config": {
    "segments": ["ui", "model", "api", "lib", "config"]
  },
  "layers": [
    { 
      "id": "app", 
      "allowed_imports": ["pages", "widgets", "features", "entities", "shared"],
      "responsibilities": {
        "owns": ["providers", "routing", "global styles", "app initialization"],
        "must_not": ["contain business logic"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "pages", 
      "allowed_imports": ["widgets", "features", "entities", "shared"],
      "responsibilities": {
        "owns": ["composition of widgets for a route"],
        "must_not": ["contain business logic"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "widgets", 
      "allowed_imports": ["features", "entities", "shared"],
      "responsibilities": {
        "owns": ["composition of features", "reusable page sections"],
        "must_not": ["contain business logic directly"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "features", 
      "allowed_imports": ["entities", "shared"],
      "responsibilities": {
        "owns": ["user interactions with business value (AddToCart, LoginForm)"],
        "must_not": ["import from other features", "know about pages"],
        "depends_on_abstractions": true
      }
    },
    { 
      "id": "entities", 
      "allowed_imports": ["shared"],
      "responsibilities": {
        "owns": ["business objects and their operations (User, Product, Order)"],
        "must_not": ["import from features or above", "contain UI components ideally"],
        "depends_on_abstractions": true
      }
    },
    { 
      "id": "shared", 
      "allowed_imports": [],
      "responsibilities": {
        "owns": ["reusable infra with no business logic (ui-kit, api client, utils)"],
        "must_not": ["import from any other layer", "contain business logic"],
        "depends_on_abstractions": false
      }
    }
  ],
  "import_matrix": {
    "app":      ["pages", "widgets", "features", "entities", "shared"],
    "pages":    ["widgets", "features", "entities", "shared"],
    "widgets":  ["features", "entities", "shared"],
    "features": ["entities", "shared"],
    "entities": ["shared"],
    "shared":   []
  },
  "abstraction_boundaries": [
    {
      "boundary_name": "features→entities",
      "inner_layer": "entities",
      "outer_layer": "features",
      "interface_required": true,
      "interface_location": "model",
      "forbidden_leakage": ["API raw responses", "implementation details of storage"]
    }
  ],
  "domain_rules": {
    "entities_location": "entities",
    "value_objects_allowed": true,
    "entity_rules": {
      "must_be_immutable": true,
      "no_framework_imports": true,
      "validation_location": "factory-function"
    },
    "anemic_model_allowed": false,
    "ubiquitous_language": {
      "enforced": true
    }
  },
  "structural_constraints": {
    "max_component_depth": 5,
    "barrel_exports_required": true,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "via-public-api-only"
  },
  "ui_constraints": {
    "component_max_props": 7,
    "prop_drilling_max_depth": 2,
    "logic_in_components": false,
    "style_co_location": true,
    "allowed_style_extensions": [".css", ".module.css"],
    "prefer_composition": true
  },
  "state_constraints": {
    "global_state_scope": "feature-based",
    "local_state_allowed": true,
    "derived_state_strategy": "selectors",
    "forbidden_patterns": ["direct-mutation", "prop-drilling"]
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["features", "entities"],
    "forbidden_in_layers": ["app", "pages", "widgets", "shared"],
    "async_pattern": "async-await",
    "data_fetching_scope": "entities"
  },
  "naming_conventions": {
    "global_strategy": "kebab-case",
    "component": "PascalCase",
    "hook": "camelCase (use* prefix)",
    "store": "camelCase (*Store suffix)",
    "service": "camelCase (*Service suffix)",
    "type": "PascalCase (*Type | *Props suffix)",
    "constant": "SCREAMING_SNAKE_CASE"
  },
  "file_conventions": {
    "types": {
      "component": {
        "pattern": "*.svelte",
        "companions": {
          "style":  { "required": true,  "extensions": [".module.css", ".css"] },
          "test":   { "required": true,  "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "hook": {
        "pattern": "*.hook.ts",
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
      "filename": "index",
      "extensions": [".ts"],
      "expose_internals": false
    },
    "test_placement": "colocated",
    "directory": {
      "max_depth": 5,
      "feature_root_marker": "index.ts"
    },
    "forbidden_patterns": [
      "default-export-on-utility",
      "barrel-in-non-feature-root",
      "named-export-mix-in-component-file"
    ]
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};
