import * as v from 'valibot';

export const EnforcementSchema = v.union([
  v.literal('strict'),
  v.literal('moderate'),
  v.literal('relaxed'),
]);

export const OutputModeSchema = v.union([
  v.literal('compact'),
  v.literal('balanced'),
  v.literal('verbose'),
]);

export const LayerSchema = v.object({
  id: v.string(),
  allowed_imports: v.array(v.string()),
  forbidden_imports: v.optional(v.array(v.string())),
});

// ─── File Conventions agora com companion opcional e pattern livre ────────────
export const CompanionRuleSchema = v.object({
  required: v.boolean(),
  extensions: v.array(v.string()), // ex: ['.test.ts', '.spec.ts']
});

export const FileTypeConventionSchema = v.object({
  pattern: v.string(),             // ex: "*.component.tsx"
  companions: v.optional(          // null = sem companions obrigatórios
    v.nullable(v.record(v.string(), CompanionRuleSchema))
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
  component_max_lines: v.number(),
  component_max_props: v.number(),
  prop_drilling_max_depth: v.number(),
  logic_in_components: v.boolean(),
  style_co_location: v.boolean(),
  allowed_style_extensions: v.array(v.string()),
  prefer_composition: v.boolean(),
});

export const PolicySchema = v.object({
  meta: v.object({
    version: v.string(),
    generated_at: v.string(),
    enforcement: EnforcementSchema,
    output_mode: OutputModeSchema,
    token_budget: v.optional(v.number()),
  }),
  stack: v.object({
    domain: v.literal('frontend'),
    pattern: v.string(),
    state_philosophy: v.string(),
    styling_strategy: v.string(),
    routing_strategy: v.string(),
  }),
  layers: v.array(LayerSchema),
  import_matrix: v.record(v.string(), v.array(v.string())),
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
  ui_constraints: UIConstraintsSchema,
  state_constraints: v.object({
    global_state_scope: v.string(),
    local_state_allowed: v.boolean(),
    derived_state_strategy: v.string(),
    forbidden_patterns: v.array(v.string()),
  }),
  side_effect_boundaries: SideEffectBoundariesSchema,
  naming_conventions: v.record(v.string(), v.string()),
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
export type Enforcement = v.InferOutput<typeof EnforcementSchema>;
export type OutputMode = v.InferOutput<typeof OutputModeSchema>;
