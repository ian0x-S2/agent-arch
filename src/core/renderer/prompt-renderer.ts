import type { Policy } from '../../schema/policy.schema';

type RenderMode = 'compact' | 'balanced' | 'verbose';

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
    `ARCH_POLICY v${meta.version} | ${stack.domain} | ${stack.pattern} | ${meta.enforcement.toUpperCase()}`,
    `STACK state=${stack.state_philosophy} style=${stack.styling_strategy} routing=${stack.routing_strategy}`,
    `LAYERS ${layerLines}`,
    `RULES circular=FORBIDDEN cross_feature=${structural_constraints.cross_feature_imports} max_depth=${structural_constraints.max_component_depth} barrel=${structural_constraints.barrel_exports_required ? 'REQUIRED' : 'OPTIONAL'}`,
    `UI max_lines=${ui_constraints.component_max_lines} logic=${ui_constraints.logic_in_components ? 'ALLOWED' : 'FORBIDDEN'} style_coloc=${ui_constraints.style_co_location ? 'REQUIRED' : 'OPTIONAL'}`,
    `STATE scope=${state_constraints.global_state_scope} local=${state_constraints.local_state_allowed ? 'ALLOWED' : 'FORBIDDEN'} derived=${state_constraints.derived_state_strategy}`,
    `STATE_FORBIDDEN ${state_constraints.forbidden_patterns.join(',')}`,
    `SIDE_EFFECTS allowed=[${side_effect_boundaries.allowed_in_layers.join(',')}] forbidden=[${side_effect_boundaries.forbidden_in_layers.join(',')}] fetch=${side_effect_boundaries.data_fetching_scope}`,
    `NAMING ${Object.entries(naming_conventions).map(([k, v]) => `${k}=${v}`).join(' ')}`,
    `FILES ${namingLines}`,
    `COLOC=${file_conventions.colocation.toUpperCase()} TEST=${file_conventions.test_placement} PUBLIC_API=${file_conventions.public_api.required ? 'REQUIRED' : 'OPTIONAL'}`,
    file_conventions.forbidden_patterns.length
      ? `FILE_FORBIDDEN ${file_conventions.forbidden_patterns.join(',')}`
      : null,
  ].filter(Boolean).join('\n');
};

// ─── Balanced: estruturado, sem linhas em branco desnecessárias ───────────────
const renderBalanced = (policy: Policy): string => {
  const { stack, meta, layers, import_matrix, structural_constraints,
          ui_constraints, state_constraints, file_conventions,
          naming_conventions, side_effect_boundaries } = policy;

  const enforcementHeader = meta.enforcement === 'strict'
    ? `# ARCH POLICY — STRICT ENFORCEMENT\n# VIOLATIONS MUST NOT BE INTRODUCED\n`
    : meta.enforcement === 'moderate'
    ? `# ARCH POLICY — MODERATE ENFORCEMENT\n# VIOLATIONS TRIGGER WARNINGS\n`
    : `# ARCH POLICY — RELAXED ENFORCEMENT\n# RULES ARE ADVISORY\n`;

  const layerBlock = layers
    .map(l => `  ${l.id.toUpperCase()}: [${(import_matrix[l.id] ?? []).join(', ')}]`)
    .join('\n');

  const fileBlock = flattenFileConventions(file_conventions)
    .map(line => `  ${line}`)
    .join('\n');

  const namingBlock = Object.entries(naming_conventions)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  return [
    enforcementHeader.trimEnd(),
    `STACK: ${stack.domain} | ${stack.pattern} | state=${stack.state_philosophy} | style=${stack.styling_strategy} | routing=${stack.routing_strategy}`,
    `\nLAYERS (unidirectional, import only as declared):\n${layerBlock}`,
    `  circular=FORBIDDEN | cross_feature=${structural_constraints.cross_feature_imports}`,
    `\nFILE CONVENTIONS:\n${fileBlock}`,
    `  colocation=${file_conventions.colocation} | test=${file_conventions.test_placement} | public_api=${file_conventions.public_api.required ? 'REQUIRED(index.ts)' : 'OPTIONAL'}`,
    file_conventions.forbidden_patterns.length
      ? `FILE FORBIDDEN: ${file_conventions.forbidden_patterns.join(', ')}`
      : null,
    `\nNAMING:\n${namingBlock}`,
    `\nCONSTRAINTS:`,
    `  component_max_lines=${ui_constraints.component_max_lines}`,
    `  logic_in_components=${ui_constraints.logic_in_components ? 'ALLOWED' : 'FORBIDDEN'}`,
    `  max_dir_depth=${structural_constraints.max_component_depth}`,
    `  barrel_exports=${structural_constraints.barrel_exports_required ? 'REQUIRED' : 'OPTIONAL'}`,
    `  style_colocation=${ui_constraints.style_co_location ? 'REQUIRED' : 'OPTIONAL'}`,
    `\nSTATE:`,
    `  scope=${state_constraints.global_state_scope} | local=${state_constraints.local_state_allowed ? 'ALLOWED' : 'FORBIDDEN'} | derived=${state_constraints.derived_state_strategy}`,
    `  forbidden: ${state_constraints.forbidden_patterns.join(', ')}`,
    `\nSIDE EFFECTS:`,
    `  allowed_in=[${side_effect_boundaries.allowed_in_layers.join(', ')}]`,
    `  forbidden_in=[${side_effect_boundaries.forbidden_in_layers.join(', ')}]`,
    `  pattern=${side_effect_boundaries.async_pattern} | fetch_scope=${side_effect_boundaries.data_fetching_scope}`,
  ].filter(v => v !== null).join('\n');
};

// ─── Verbose: full, com contexto para agentes menos capazes ──────────────────
const renderVerbose = (policy: Policy): string => {
  const { stack, meta, layers, import_matrix, structural_constraints,
          ui_constraints, state_constraints, file_conventions,
          naming_conventions, side_effect_boundaries } = policy;

  const layerBlock = layers.map(l => {
    const allowed = import_matrix[l.id] ?? [];
    const forbidden = l.forbidden_imports ?? [];
    return [
      `### ${l.id.toUpperCase()}`,
      `  MAY IMPORT: ${allowed.length ? allowed.join(', ') : 'nothing'}`,
      forbidden.length ? `  MUST NOT IMPORT: ${forbidden.join(', ')}` : null,
    ].filter(Boolean).join('\n');
  }).join('\n');

  const fileBlock = flattenFileConventions(file_conventions)
    .map(line => `  ${line}`)
    .join('\n');

  return [
    `# ARCHITECTURAL POLICY`,
    `# Version: ${meta.version} | Generated: ${meta.generated_at}`,
    `# Enforcement: ${meta.enforcement.toUpperCase()}`,
    meta.enforcement === 'strict' ? `# CRITICAL: All rules are mandatory. Do not deviate under any circumstance.` : null,
    meta.enforcement === 'moderate' ? `# Violations are permitted only with explicit justification.` : null,
    meta.enforcement === 'relaxed' ? `# Rules are advisory. Deviations are acceptable if justified.` : null,
    ``,
    `## STACK`,
    `Domain: ${stack.domain}`,
    `Pattern: ${stack.pattern}`,
    `State philosophy: ${stack.state_philosophy}`,
    `Styling strategy: ${stack.styling_strategy}`,
    `Routing strategy: ${stack.routing_strategy}`,
    ``,
    `## LAYER ARCHITECTURE`,
    `Layers are unidirectional. A layer may only import from layers listed under it.`,
    layerBlock,
    `Cross-feature imports: ${structural_constraints.cross_feature_imports}`,
    `Circular imports: FORBIDDEN`,
    ``,
    `## FILE CONVENTIONS`,
    fileBlock,
    `Colocation policy: ${file_conventions.colocation} (companions must live beside source file)`,
    `Test placement: ${file_conventions.test_placement}`,
    `Public API: ${file_conventions.public_api.required ? 'Each feature must expose an index.ts. Internal files must not be imported directly.' : 'No index file required.'}`,
    file_conventions.forbidden_patterns.length
      ? `Forbidden file patterns: ${file_conventions.forbidden_patterns.join(', ')}`
      : null,
    ``,
    `## NAMING CONVENTIONS`,
    ...Object.entries(naming_conventions).map(([k, v]) => `${k}: ${v}`),
    ``,
    `## CONSTRAINTS`,
    `Max lines per component: ${ui_constraints.component_max_lines}`,
    `Logic in UI components: ${ui_constraints.logic_in_components ? 'ALLOWED (minimal)' : 'FORBIDDEN — extract to hooks'}`,
    `Max directory depth: ${structural_constraints.max_component_depth}`,
    `Barrel exports: ${structural_constraints.barrel_exports_required ? 'REQUIRED at feature roots' : 'OPTIONAL'}`,
    `Style co-location: ${ui_constraints.style_co_location ? 'REQUIRED — style file must live next to component' : 'OPTIONAL'}`,
    ``,
    `## STATE MANAGEMENT`,
    `Global scope: ${state_constraints.global_state_scope}`,
    `local state: ${state_constraints.local_state_allowed ? 'ALLOWED for UI-only state' : 'FORBIDDEN'}`,
    `Derived state: use ${state_constraints.derived_state_strategy}`,
    `Forbidden patterns: ${state_constraints.forbidden_patterns.join(', ')}`,
    ``,
    `## SIDE EFFECTS`,
    `Allowed in layers: ${side_effect_boundaries.allowed_in_layers.join(', ')}`,
    `Forbidden in layers: ${side_effect_boundaries.forbidden_in_layers.join(', ')}`,
    `Async pattern: ${side_effect_boundaries.async_pattern}`,
    `Data fetching scope: ${side_effect_boundaries.data_fetching_scope}`,
  ].filter(v => v !== null).join('\n');
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const renderPrompt = (policy: Policy): string => {
  const mode: RenderMode = policy.meta.output_mode;
  switch (mode) {
    case 'compact':  return renderCompact(policy);
    case 'verbose':  return renderVerbose(policy);
    case 'balanced':
    default:         return renderBalanced(policy);
  }
};
