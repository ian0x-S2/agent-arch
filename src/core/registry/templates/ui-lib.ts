import type { Policy } from '../../../schema/policy.schema';

export const UI_LIB_DESIGN_SYSTEM = `# Architecture Policy
Pattern: ui-lib | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
patterns → components → primitives (unidirectional, strict)

| Layer      | May Import              |
|------------|-------------------------|
| patterns   | components, primitives  |
| components | primitives              |
| primitives | —                       |

- Circular imports: FORBIDDEN
- Cross-layer imports must go through index.ts

## Directory Structure
src/
├── primitives/<Component>/
│   ├── Component.svelte        # unstyled, polymorphic — aria/role only
│   ├── Component.types.ts
│   └── index.ts
├── components/<Component>/
│   ├── Component.svelte        # compound: Component.Root, Component.Icon
│   ├── Component.context.svelte.ts  # scoped $state for compound parts — not exported
│   ├── Component.types.ts
│   ├── Component.test.ts
│   └── index.ts                # exports Component namespace
├── patterns/<Pattern>/
│   ├── Pattern.svelte          # composes multiple components
│   └── index.ts
└── index.ts                    # package root — public API only

## File Conventions
| Type      | File                | Export          |
|-----------|---------------------|-----------------|
| component | *.svelte            | PascalCase      |
| context   | *.context.svelte.ts | camelCase       |
| hook      | *.svelte.ts         | camelCase       |
| types     | *.types.ts          | PascalCase      |
| constants | *.constants.ts      | SCREAMING_SNAKE |

- Component files: PascalCase | Utility files: kebab-case
- Barrel exports: required at every component root
- Context files: private — never exported via index.ts

## Component Rules
- No business logic at any layer
- No data fetching at any layer
- Support controlled and uncontrolled variants — controlled via props, uncontrolled via default* props
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
- Max props: 10 — split into compound parts if exceeded
- Separate style props from behavior props (variant/size vs onClick/disabled)
- No prop drilling beyond depth 2 — use scoped Context for compound internals
- Primitives accept children: Snippet and spread rest props via $props() — no as prop
- Prefer composition over configuration (slots over boolean props)

## Compound Component Pattern
- Export style: namespace (Button.Root, Button.Icon, Button.Trigger)
- Never export compound parts standalone
- Compound state shared via *.context.svelte.ts — never exposed outside component boundary

## Svelte 5 Runes
- $state → UI-only component state (isOpen, isFocused, isDisabled)
- $derived → computed values (never $effect for derived state)
- $effect → side effects only (DOM, subscriptions)
- $props → component interface
- $bindable → explicit two-way binding (use sparingly)
- No legacy stores for local state

## Publish Contract
- package.json exports map required — every component gets its own export path
- Types exported — ship .d.ts alongside every component
- Peer dependency: svelte — never bundle peer deps

## Forbidden
- Circular imports
- Arbitrary Tailwind values (text-[14px] → use text-sm)
- Business logic at any layer
- Data fetching at any layer
- Global state managers
- Module-level shared state between unrelated components
- Exporting context files via index.ts
- Standalone export of compound parts
- any type (use unknown + narrowing)
- Type assertions (as) except at data boundaries`;

export const uiLibTemplate: Policy = {
    meta: {
        version: '1.1.0',
        generated_at: new Date().toISOString(),
    },
    stack: {
        domain: 'frontend',
        pattern: 'ui-lib',
        state_philosophy: 'minimal',
        styling_strategy: 'utility-first',
        framework: 'svelte',
        component_lib: undefined,
    },
    ui_lib_config: {
        token_categories: [],
        compound_pattern: {
            enforced: true,
            root_suffix: 'Root',
            export_style: 'namespace',
        },
        publish: {
            package_exports_required: true,
            barrel_per_component: true,
            types_exported: true,
            peer_dependencies: ['svelte'],
        },
    },
    layers: [
        {
            id: 'patterns',
            allowed_imports: ['components', 'primitives'],
            responsibilities: {
                owns: ['compositions of multiple components'],
                must_not: ['business logic', 'data fetching'],
                depends_on_abstractions: true,
            },
        },
        {
            id: 'components',
            allowed_imports: ['primitives'],
            responsibilities: {
                owns: ['compound components', 'scoped context'],
                must_not: ['business logic', 'data fetching'],
                depends_on_abstractions: true,
            },
        },
        {
            id: 'primitives',
            allowed_imports: [],
            responsibilities: {
                owns: ['unstyled base elements', 'polymorphic behavior'],
                must_not: ['business logic', 'data fetching'],
                depends_on_abstractions: false,
            },
        },
    ],
    import_matrix: {
        patterns: ['components', 'primitives'],
        components: ['primitives'],
        primitives: [],
    },
    structural_constraints: {
        max_component_depth: 3,
        barrel_exports_required: true,
        circular_imports: 'FORBIDDEN',
        cross_feature_imports: 'via-public-api-only',
    },
    ui_constraints: {
        component_max_props: 10,
        prop_drilling_max_depth: 2,
        logic_in_components: false,
        style_co_location: true,
        allowed_style_extensions: [],
        prefer_composition: true,
    },
    state_constraints: {
        global_state_scope: 'minimal',
        local_state_allowed: true,
        derived_state_strategy: 'runes',
        forbidden_patterns: [
            'global-state-managers',
            'business-logic-at-any-layer',
            'data-fetching-at-any-layer',
            'exporting-context-files',
            'standalone-compound-part-export',
        ],
    },
    side_effect_boundaries: {
        allowed_in_layers: [],
        forbidden_in_layers: ['patterns', 'components', 'primitives'],
        async_pattern: 'hooks',
        data_fetching_scope: 'none',
    },
    naming_conventions: {
        global_strategy: 'PascalCase',
        component: 'PascalCase',
        hook: 'camelCase',
        constant: 'SCREAMING_SNAKE',
    },
    file_conventions: {
        types: {
            component: {
                pattern: '*.svelte',
            },
            context: {
                pattern: '*.context.svelte.ts',
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
            filename: 'index',
            extensions: ['.ts'],
            expose_internals: false,
        },
        test_placement: 'colocated',
        directory: {
            max_depth: 3,
            feature_root_marker: 'index.ts',
        },
        forbidden_patterns: [
            'arbitrary-tailwind-values',
            'any-type',
            'type-assertion-as',
        ],
    },
    token_metadata: {
        estimated_prompt_tokens: 0,
        compression_applied: false,
        omitted_sections: [],
    },
};
