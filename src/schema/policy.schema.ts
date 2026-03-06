import * as v from 'valibot';

export const OutputModeSchema = v.literal('compact');

export const LayerResponsibilitiesSchema = v.object({
  owns: v.array(v.string()),
  must_not: v.array(v.string()),
  depends_on_abstractions: v.boolean(),
});

export const LayerSchema = v.object({
  id: v.string(),
  allowed_imports: v.array(v.string()),
  forbidden_imports: v.optional(v.array(v.string())),
  responsibilities: v.optional(LayerResponsibilitiesSchema),
});

// ─── File Conventions agora com companion opcional e pattern livre ────────────
export const CompanionRuleSchema = v.object({
  required: v.boolean(),
  extensions: v.array(v.string()), // ex: ['.test.ts', '.spec.ts']
});

export const FileTypeConventionSchema = v.object({
  pattern: v.string(),             // ex: "*.component.tsx"
  companions: v.optional(          // undefined = sem companions obrigatórios
    v.record(v.string(), CompanionRuleSchema)
  ),
  // ex: { test: { required: true, extensions: ['.test.ts'] },
  //        style: { required: false, extensions: ['.module.css'] } }
});

export const FileConventionsSchema = v.object({
  // Cada tipo de arquivo tem sua própria definição completa
  types: v.record(v.string(), FileTypeConventionSchema),
  // ex: { component: { pattern: "*.component.tsx", companions: { test: {...}, style: {...} } } }

  colocation: v.union([v.literal('strict'), v.literal('loose'), v.literal('none')]),

  public_api: v.object({
    required: v.boolean(),
    filename: v.optional(v.string()),       // default: "index"
    extensions: v.optional(v.array(v.string())), // default: [".ts", ".tsx"]
    expose_internals: v.boolean(),
  }),

  test_placement: v.union([
    v.literal('colocated'),
    v.literal('__tests__-sibling'),
    v.literal('dedicated-root'),
  ]),

  directory: v.optional(v.object({
    max_depth: v.number(),
    feature_root_marker: v.optional(v.string()), // ex: "index.ts"
  })),

  forbidden_patterns: v.array(v.string()),
});

export const SideEffectBoundariesSchema = v.object({
  allowed_in_layers: v.array(v.string()),
  forbidden_in_layers: v.array(v.string()),
  async_pattern: v.string(),
  data_fetching_scope: v.string(),
});

export const UIConstraintsSchema = v.object({
  component_max_props: v.number(),
  prop_drilling_max_depth: v.number(),
  logic_in_components: v.boolean(),
  style_co_location: v.boolean(),
  allowed_style_extensions: v.array(v.string()),
  prefer_composition: v.boolean(),
});

export const AbstractionBoundarySchema = v.object({
  boundary_name: v.string(),
  inner_layer: v.string(),
  outer_layer: v.string(),
  interface_required: v.boolean(),
  interface_location: v.string(),
  forbidden_leakage: v.array(v.string()),
});

export const ErrorHandlingSchema = v.object({
  layer: v.string(),
  strategy: v.union([
    v.literal('throw-domain-error'),
    v.literal('return-result-type'),
    v.literal('propagate'),
    v.literal('silent-log'),
  ]),
  allowed_error_types: v.array(v.string()),
  forbidden_error_types: v.array(v.string()),
  boundary_mapping_required: v.boolean(),
});

export const DomainRulesSchema = v.object({
  entities_location: v.string(),
  value_objects_allowed: v.boolean(),
  entity_rules: v.object({
    must_be_immutable: v.boolean(),
    no_framework_imports: v.boolean(),
    validation_location: v.union([
      v.literal('constructor'),
      v.literal('factory-function'),
      v.literal('external-validator'),
    ]),
  }),
  anemic_model_allowed: v.boolean(),
  ubiquitous_language: v.object({
    enforced: v.boolean(),
    glossary_path: v.optional(v.string()),
  }),
});

export const CompoundPatternSchema = v.object({
  enforced: v.boolean(),
  root_suffix: v.string(),
  export_style: v.union([
    v.literal('namespace'),
    v.literal('named'),
  ]),
});

export const PublishConfigSchema = v.object({
  package_exports_required: v.boolean(),
  barrel_per_component: v.boolean(),
  types_exported: v.boolean(),
  peer_dependencies: v.array(v.string()),
});

export const UiLibConfigSchema = v.optional(v.object({
  token_categories: v.array(v.string()),
  compound_pattern: CompoundPatternSchema,
  publish: PublishConfigSchema,
}));

export const PolicySchema = v.object({
  meta: v.object({
    version: v.string(),
    generated_at: v.string(),
    output_mode: OutputModeSchema,
    token_budget: v.optional(v.number()),
  }),
  stack: v.object({
    domain: v.literal('frontend'),
    pattern: v.string(),
    state_philosophy: v.string(),
    styling_strategy: v.string(),
    framework: v.optional(v.union([v.literal('react'), v.literal('vue'), v.literal('svelte')])),
    component_lib: v.optional(v.string()),
  }),
  fsd_config: v.optional(v.object({
    segments: v.array(v.string()),
  })),
  layers: v.array(LayerSchema),
  import_matrix: v.record(v.string(), v.array(v.string())),
  abstraction_boundaries: v.optional(v.array(AbstractionBoundarySchema)),
  error_handling_strategy: v.optional(v.array(ErrorHandlingSchema)),
  domain_rules: v.optional(DomainRulesSchema),
  ui_lib_config: UiLibConfigSchema,
  structural_constraints: v.object({
    max_component_depth: v.number(),
    barrel_exports_required: v.boolean(),
    circular_imports: v.literal('FORBIDDEN'),
    cross_feature_imports: v.union([
      v.literal('via-public-api-only'),
      v.literal('FORBIDDEN'),
      v.literal('allowed'),
    ]),
  }),
  cross_module_communication: v.optional(v.union([
    v.literal('via-shared-only'),
    v.literal('via-event-bus'),
    v.literal('via-context'),
    v.literal('any'),
  ])),
  atomic_config: v.optional(v.object({
    layer_internals: v.record(v.string(), v.array(v.string()))
  })),
  graduation_signals: v.optional(v.object({
    component_count_threshold: v.number(),
    duplicated_fetch_threshold: v.number(),
    suggested_next_pattern: v.optional(v.string()),
  })),
  ui_constraints: UIConstraintsSchema,
  state_constraints: v.object({
    global_state_scope: v.string(),
    local_state_allowed: v.boolean(),
    derived_state_strategy: v.string(),
    forbidden_patterns: v.array(v.string()),
  }),
  side_effect_boundaries: SideEffectBoundariesSchema,
  naming_conventions: v.looseObject({
    global_strategy: v.union([
      v.literal('kebab-case'),
      v.literal('PascalCase'),
      v.literal('snake_case'),
      v.literal('camelCase'),
    ]),
    component: v.optional(v.string()),
    hook: v.optional(v.string()),
    store: v.optional(v.string()),
    service: v.optional(v.string()),
    constant: v.optional(v.string()),
    type: v.optional(v.string()),
    test: v.optional(v.string()),
  }),
  file_conventions: FileConventionsSchema,
  token_metadata: v.object({
    estimated_prompt_tokens: v.number(),
    compression_applied: v.boolean(),
    omitted_sections: v.array(v.string()),
  }),
});
export type Policy = v.InferOutput<typeof PolicySchema>;
export type Layer = v.InferOutput<typeof LayerSchema>;
export type FileConventions = v.InferOutput<typeof FileConventionsSchema>;
export type FileTypeConvention = v.InferOutput<typeof FileTypeConventionSchema>;
export type CompanionRule = v.InferOutput<typeof CompanionRuleSchema>;
export type OutputMode = v.InferOutput<typeof OutputModeSchema>;
