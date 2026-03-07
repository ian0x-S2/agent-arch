import type { Policy } from '../../../schema/policy.schema';

export const atomicTemplate: Policy = {
  meta: {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    output_mode: 'compact',
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
      id: 'pages',
      allowed_imports: ['templates', 'organisms', 'molecules', 'atoms', 'shared'],
      responsibilities: {
        owns: ['Route components', 'Data fetching', 'Connecting templates to real data'],
        must_not: ['Contain complex UI logic', 'Directly define complex layouts'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'templates',
      allowed_imports: ['organisms', 'molecules', 'atoms', 'shared'],
      responsibilities: {
        owns: ['Page-level layout structures', 'Slot-based composition'],
        must_not: ['Know about real data', 'Manage business logic'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'organisms',
      allowed_imports: ['molecules', 'atoms', 'shared'],
      responsibilities: {
        owns: ['Complex, standalone UI sections', 'Local state for interaction logic'],
        must_not: ['Know about routing', 'Directly access global state if possible'],
        depends_on_abstractions: true
      }
    },
    {
      id: 'molecules',
      allowed_imports: ['atoms', 'shared'],
      responsibilities: {
        owns: ['Simple combinations of atoms', 'Purely presentational logic'],
        must_not: ['Fetch data', 'Contain business rules'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'atoms',
      allowed_imports: ['shared'],
      responsibilities: {
        owns: ['Single HTML element wrappers', 'Basic styling and primitive behavior'],
        must_not: ['Import from any other layer', 'Contain any business logic'],
        depends_on_abstractions: false
      }
    },
    {
      id: 'shared',
      allowed_imports: [],
      responsibilities: {
        owns: ['Utils', 'Theme constants', 'Global types'],
        must_not: ['Import from UI layers'],
        depends_on_abstractions: false
      }
    },
  ],
  import_matrix: {
    pages: ['templates', 'organisms', 'molecules', 'atoms', 'shared'],
    templates: ['organisms', 'molecules', 'atoms', 'shared'],
    organisms: ['molecules', 'atoms', 'shared'],
    molecules: ['atoms', 'shared'],
    atoms: ['shared'],
    shared: [],
  },
  structural_constraints: {
    max_component_depth: 5,
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
    component_max_props: 7,
    prop_drilling_max_depth: 3,
    logic_in_components: true,
    style_co_location: true,
    allowed_style_extensions: ['.module.css', '.css'],
    prefer_composition: true,
  },
  state_constraints: {
    global_state_scope: 'minimal',
    local_state_allowed: true,
    derived_state_strategy: 'selectors',
    forbidden_patterns: ['prop-drilling-beyond-3-levels', 'global-state-for-ui-toggle'],
  },
  side_effect_boundaries: {
    allowed_in_layers: ['pages', 'templates', 'organisms'],
    forbidden_in_layers: ['molecules', 'atoms'],
    async_pattern: 'hooks',
    data_fetching_scope: 'pages',
  },
  naming_conventions: {
    global_strategy: 'kebab-case',
    component: 'PascalCase',
    hook: 'camelCase',
  },
  file_conventions: {
    types: {
      component: {
        pattern: '*.ts',
        companions: {
          test: { required: true, extensions: ['.test.ts'] },
          style: { required: false, extensions: ['.module.css'] },
        },
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
    forbidden_patterns: [],
  },
  token_metadata: {
    estimated_prompt_tokens: 0,
    compression_applied: false,
    omitted_sections: [],
  },
};
