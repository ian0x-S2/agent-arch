import type { Policy } from '../../schema/policy.schema';

// Helper to flatten the new file_conventions structure
const flattenFileConventions = (fc: Policy['file_conventions']) => {
  const lines: string[] = [];
  for (const [typeName, def] of Object.entries(fc.types)) {
    const companions = def.companions
      ? Object.entries(def.companions)
          .map(([name, rule]) => `${name}(${rule.required ? 'required' : 'optional'})`)
          .join(', ')
      : 'none';
    lines.push(`${typeName}=${def.pattern} companions=[${companions}]`);
  }
  return lines;
};

// ─── Compact: máxima densidade, zero redundância ──────────────────────────────
const renderCompact = (policy: Policy): string => {
  const { stack, meta, layers, import_matrix, structural_constraints,
          ui_constraints, state_constraints, file_conventions,
          naming_conventions, side_effect_boundaries } = policy;

  const layerLines = layers
    .map(l => `${l.id.toUpperCase()}→[${(import_matrix[l.id] ?? []).join(',')}]`)
    .join(' | ');

  const namingLines = flattenFileConventions(file_conventions).join(' | ');

  return [
    `ARCH_POLICY v${meta.version} | ${stack.domain} | ${stack.pattern}`,
    `STACK state=${stack.state_philosophy} style=${stack.styling_strategy} routing=${stack.routing_strategy}`,
    `LAYERS ${layerLines}`,
    `STRUCTURE ${renderCompactStructure(policy)}`,
    `RULES circular=FORBIDDEN cross_feature=${structural_constraints.cross_feature_imports} max_depth=${structural_constraints.max_component_depth} barrel=${structural_constraints.barrel_exports_required ? 'REQUIRED' : 'OPTIONAL'}`,
    `UI max_props=${ui_constraints.component_max_props} prop_drilling=${ui_constraints.prop_drilling_max_depth} logic=${ui_constraints.logic_in_components ? 'ALLOWED' : 'FORBIDDEN'} style_coloc=${ui_constraints.style_co_location ? 'REQUIRED' : 'OPTIONAL'} preferred_extensions=${ui_constraints.allowed_style_extensions.join(',') || 'none'}`,
    `STATE scope=${state_constraints.global_state_scope} local=${state_constraints.local_state_allowed ? 'ALLOWED' : 'FORBIDDEN'} derived=${state_constraints.derived_state_strategy}`,
    `STATE_FORBIDDEN ${state_constraints.forbidden_patterns.join(',')}`,
    `SIDE_EFFECTS allowed=[${side_effect_boundaries.allowed_in_layers.join(',')}] forbidden=[${side_effect_boundaries.forbidden_in_layers.join(',')}] fetch=${side_effect_boundaries.data_fetching_scope}`,
    `NAMING ${Object.entries(naming_conventions).map(([k, v]) => `${k}=${v}`).join(' ')}`,
    `FILES ${namingLines}`,
    `COLOC=${file_conventions.colocation.toUpperCase()} TEST=${file_conventions.test_placement} PUBLIC_API=${file_conventions.public_api.required ? 'REQUIRED(index.ts)' : 'OPTIONAL'}`,
    file_conventions.forbidden_patterns.length
      ? `FILE_FORBIDDEN ${file_conventions.forbidden_patterns.join(',')}`
      : null,
  ].filter(Boolean).join('\n');
};

const renderCompactStructure = (policy: Policy): string => {
  const { stack, layers, fsd_config } = policy;
  const pattern = stack.pattern;

  if (pattern === 'feature-sliced') {
    const segments = fsd_config?.segments ?? ['ui', 'model', 'api', 'lib'];
    const layerDirs = layers.map(l => l.id).join(', ');
    return `FSD: src/{${layerDirs}}/<slice>/{${segments.join(',')}}`;
  }

  if (pattern === 'modular') {
    const internals = Object.keys(policy.file_conventions.types)
      .filter(t => !['types', 'constants'].includes(t))
      .join(',');
    return `MODULAR: src/{modules/<name>/{${internals}},shared/{ui,utils,types}}`;
  }

  if (pattern === 'flat') {
    return `FLAT: src/{components,hooks,services,types,utils} - graduation signals: >20 components, duplicate fetch in 3+ places`;
  }

  if (pattern === 'atomic') {
    const layerDirs = layers.map(l => l.id).join(' → ');
    return `ATOMIC: src/{${layerDirs}}`;
  }

  return '';
};

// ─── Public API ───────────────────────────────────────────────────────────────
export interface RenderResult {
  content: string;
  tokens: number;
}

export const renderPrompt = (policy: Policy): RenderResult => {
  const rendered = renderCompact(policy);
  const tokens = Math.ceil(rendered.length / 4);
  return { content: rendered, tokens };
};
