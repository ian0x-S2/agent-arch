import type { Policy } from '../../../schema/policy.schema';

export const uiLibTemplate: Policy = {
    meta: {
        version: '1.0.0',
        output_mode: 'compact',
        generated_at: '',
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
        token_categories: ['color', 'spacing', 'typography', 'radius', 'shadow'],
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
            id: 'tokens',
            allowed_imports: [],
            responsibilities: {
                owns: [
                    'design tokens (color, spacing, typography, radius, shadow)',
                    'CSS custom properties',
                    'theme contract',
                ],
                must_not: [
                    'import from any other layer',
                    'contain component logic',
                    'reference framework APIs',
                ],
                depends_on_abstractions: false,
            },
        },
        {
            id: 'primitives',
            allowed_imports: ['tokens'],
            responsibilities: {
                owns: [
                    'unstyled base elements (Box, Text, Icon)',
                    'accessibility attributes (aria-*, role)',
                    'rest props spread via `$props()` for full HTML attribute passthrough',
                ],
                must_not: [
                    'apply visual styles directly',
                    'import from components or patterns',
                    'contain business logic',
                ],
                depends_on_abstractions: false,
            },
        },
        {
            id: 'components',
            allowed_imports: ['primitives', 'tokens'],
            responsibilities: {
                owns: [
                    'compound components (Button.Root + Button.Icon)',
                    'controlled and uncontrolled variants',
                    'component-scoped types and props interfaces',
                ],
                must_not: [
                    'import from patterns layer',
                    'fetch data or call APIs',
                    'contain application business logic',
                ],
                depends_on_abstractions: true,
            },
        },
        {
            id: 'patterns',
            allowed_imports: ['components', 'primitives', 'tokens'],
            responsibilities: {
                owns: [
                    'compositions of multiple components (Form, DataTable, Modal)',
                    'higher-order interaction patterns',
                ],
                must_not: [
                    'be published as standalone primitives',
                    'introduce new tokens',
                    'import from consuming app layers',
                ],
                depends_on_abstractions: true,
            },
        },
    ],
    import_matrix: {
        tokens: [],
        primitives: ['tokens'],
        components: ['primitives', 'tokens'],
        patterns: ['components', 'primitives', 'tokens'],
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
        derived_state_strategy: 'selectors',
        forbidden_patterns: [
            'global-state-in-primitive',
            'side-effects-in-tokens',
            'styles-hardcoded-without-token',
        ],
    },
    side_effect_boundaries: {
        allowed_in_layers: ['components', 'patterns'],
        forbidden_in_layers: ['tokens', 'primitives'],
        async_pattern: 'hooks',
        data_fetching_scope: 'patterns',
    },
    naming_conventions: {
        global_strategy: 'PascalCase',
        component: 'PascalCase (ComponentName.Root, ComponentName.Trigger)',
        hook: 'camelCase (runes/logic functions)',
        store: 'camelCase',
        service: 'camelCase',
        type: 'PascalCase (*Props | *Ref suffix)',
        constant: 'SCREAMING_SNAKE_CASE',
    },
    file_conventions: {
        types: {
            component: {
                pattern: '*.ts',
                companions: {
                    types: { required: true, extensions: ['.types.ts'] },
                    test: { required: true, extensions: ['.test.ts'] },
                },
            },
            hook: {
                pattern: '*.ts',
                companions: {
                    test: { required: true, extensions: ['.test.ts'] },
                },
            },
            types: { pattern: '*.types.ts' },
            constants: { pattern: '*.constants.ts' },
            tokens: { pattern: '*.tokens.ts' },
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
            'default-export-on-component',
            'hardcoded-color-without-token',
            'style-without-token-reference',
            'compound-part-exported-without-namespace',
        ],
    },
    token_metadata: {
        estimated_prompt_tokens: 0,
        compression_applied: false,
        omitted_sections: [],
    },
};
