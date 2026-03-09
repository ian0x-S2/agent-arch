import type { Policy } from '../../../schema/policy.schema';

export const ATOMIC_DESIGN_SYSTEM = `# Architecture Policy
Pattern: atomic | Framework: Svelte 5 | Styling: utility-first
Focus: design system

## Layers & Import Direction
organisms → molecules → atoms → shared (unidirectional, strict)

| Layer     | May Import              |
|-----------|-------------------------|
| organisms | molecules, atoms, shared |
| molecules | atoms, shared           |
| atoms     | shared                  |
| shared    | —                       |

- Circular imports: FORBIDDEN

## Directory Structure
src/
├── organisms/<component>/
│   ├── ComponentName.svelte  # complex UI sections — UI state allowed, no business logic
│   ├── hooks/                # reusable reactive logic (.svelte.ts)
│   └── types/
├── molecules/<component>/
│   ├── ComponentName.svelte  # atom combinations — UI state allowed, no business logic
│   └── types/
├── atoms/<component>/
│   ├── ComponentName.svelte  # single element wrappers — primitive behavior only
│   └── types/
└── shared/
    ├── utils/                # pure functions
    ├── types/                # global types
    └── theme/                # design tokens, constants

## File Conventions
| Type      | File           | Export          |
|-----------|----------------|-----------------|
| component | *.svelte       | PascalCase      |
| hook      | *.svelte.ts    | camelCase       |
| types     | *.types.ts     | PascalCase      |
| constants | *.constants.ts | SCREAMING_SNAKE |

- Naming: kebab-case for files
- Barrel exports: required at component roots only
- No default exports on utilities

## Component Rules
- No business logic at any layer — UI state is allowed
- No data fetching at any layer
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
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
- Type assertions (as) except at data boundaries`;

export const atomicTemplate: Policy = {
  meta: {
    version: '1.1.0',
    generated_at: new Date().toISOString(),
  },
  stack: {
    domain: 'frontend',
    pattern: 'atomic',
    state_philosophy: 'minimal',
    styling_strategy: 'utility-first',
    framework: 'svelte',
    component_lib: undefined,
  },
  layers: [
    {
      id: 'organisms',
      allowed_imports: ['molecules', 'atoms', 'shared'],
      responsibilities: {
        owns: ['complex UI sections — UI state allowed'],
        must_not: ['business logic', 'data fetching'],
        depends_on_abstractions: true
      }
    },
    {
      id: 'molecules',
      allowed_imports: ['atoms', 'shared'],
      responsibilities: {
        owns: ['atom combinations — UI state allowed'],
        must_not: ['business logic', 'data fetching'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'atoms',
      allowed_imports: ['shared'],
      responsibilities: {
        owns: ['single element wrappers — primitive behavior only'],
        must_not: ['business logic', 'data fetching'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'shared',
      allowed_imports: [],
      responsibilities: {
        owns: ['utils', 'types', 'theme'],
        must_not: ['business logic', 'data fetching'],
        depends_on_abstractions: false
      }
    },
  ],
  import_matrix: {
    organisms: ['molecules', 'atoms', 'shared'],
    molecules: ['atoms', 'shared'],
    atoms: ['shared'],
    shared: [],
  },
  structural_constraints: {
    max_component_depth: 3,
    barrel_exports_required: true,
    circular_imports: 'FORBIDDEN',
    cross_feature_imports: 'via-public-api-only',
  },
  atomic_config: {
    layer_internals: {
      organisms: ['hooks', 'types'],
      molecules: ['types'],
      atoms: ['types'],
    },
  },
  ui_constraints: {
    component_max_props: 10,
    prop_drilling_max_depth: 3,
    logic_in_components: true,
    style_co_location: true,
    allowed_style_extensions: ['.module.css', '.css'],
    prefer_composition: true,
  },
  state_constraints: {
    global_state_scope: 'minimal',
    local_state_allowed: true,
    derived_state_strategy: 'runes',
    forbidden_patterns: ['prop-drilling-beyond-3-levels', 'business-logic-in-components', 'any-type', 'type-assertion-as'],
  },
  side_effect_boundaries: {
    allowed_in_layers: [],
    forbidden_in_layers: ['organisms', 'molecules', 'atoms', 'shared'],
    async_pattern: 'hooks',
    data_fetching_scope: 'none',
  },
  naming_conventions: {
    global_strategy: 'kebab-case',
    component: 'PascalCase',
    hook: 'camelCase',
    constant: 'SCREAMING_SNAKE',
  },
  file_conventions: {
    types: {
      component: {
        pattern: '*.svelte',
      },
      hook: {
        pattern: '*.svelte.ts',
      },
      types: { pattern: '*.types.ts' },
      constants: { pattern: '*.constants.ts' },
    },
    colocation: 'strict',
    public_api: {
      required: true,
      expose_internals: false,
    },
    test_placement: 'colocated',
    forbidden_patterns: ['default-export-on-utility'],
  },
  token_metadata: {
    estimated_prompt_tokens: 0,
    compression_applied: false,
    omitted_sections: [],
  },
};
