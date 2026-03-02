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
    `ARCH_POLICY v${meta.version} | ${stack.domain} | ${stack.pattern}`,
    `STACK state=${stack.state_philosophy} style=${stack.styling_strategy} routing=${stack.routing_strategy}`,
    `LAYERS ${layerLines}`,
    `RULES circular=FORBIDDEN cross_feature=${structural_constraints.cross_feature_imports} max_depth=${structural_constraints.max_component_depth} barrel=${structural_constraints.barrel_exports_required ? 'REQUIRED' : 'OPTIONAL'}`,
    `UI max_lines=${ui_constraints.component_max_lines} logic=${ui_constraints.logic_in_components ? 'ALLOWED' : 'FORBIDDEN'} style_coloc=${ui_constraints.style_co_location ? 'REQUIRED' : 'OPTIONAL'}`,
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
    return `MODULAR: src/{modules/<name>/{components,hooks,services,types},shared/{ui,utils,types}}`;
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

// ─── Balanced: estruturado, sem linhas em branco desnecessárias ───────────────
const renderBalanced = (policy: Policy): string => {
  const { stack, meta, layers, import_matrix, structural_constraints,
          ui_constraints, state_constraints, file_conventions,
          naming_conventions, side_effect_boundaries,
          abstraction_boundaries, domain_rules } = policy;

  const header = `# ARCH POLICY v${meta.version}`;

  const layerBlock = layers
    .map(l => {
      let line = `  ${l.id.toUpperCase()}: [${(import_matrix[l.id] ?? []).join(', ')}]`;
      if (l.responsibilities) {
        line += `\n    OWNS: ${l.responsibilities.owns.join(', ')}`;
        line += `\n    NOT: ${l.responsibilities.must_not.join(', ')}`;
      }
      return line;
    })
    .join('\n');

  const boundaryBlock = abstraction_boundaries?.map(b => 
    `  ${b.boundary_name}: ${b.inner_layer} (inner) ← ${b.outer_layer} (outer) [API_REQ=${b.interface_required}]`
  ).join('\n');

  return [
    header,
    `STACK: ${stack.domain} | ${stack.pattern} | state=${stack.state_philosophy} | style=${stack.styling_strategy} | routing=${stack.routing_strategy}`,
    `\nLAYERS & RESPONSIBILITIES:\n${layerBlock}`,
    `  circular=FORBIDDEN | cross_feature=${structural_constraints.cross_feature_imports}`,
    boundaryBlock ? `\nABSTRACTION BOUNDARIES:\n${boundaryBlock}` : null,
    domain_rules ? `\nDOMAIN RULES: Entity location: ${domain_rules.entities_location} | No framework: ${domain_rules.entity_rules.no_framework_imports} | Anemic allowed: ${domain_rules.anemic_model_allowed}` : null,
    `\nEXPECTED STRUCTURE:\n  ${renderCompactStructure(policy)}`,
    `\nFILE CONVENTIONS:`,
    ...flattenFileConventions(file_conventions).map(line => `  ${line}`),
    `  colocation=${file_conventions.colocation} | test=${file_conventions.test_placement} | public_api=${file_conventions.public_api.required ? 'REQUIRED(index.ts)' : 'OPTIONAL'}`,
  ].filter(v => v !== null).join('\n');
};

// ─── Verbose: full, com contexto para agentes menos capazes ──────────────────
const renderVerbose = (policy: Policy): string => {
  const { stack, meta, layers, import_matrix, structural_constraints,
          ui_constraints, state_constraints, file_conventions,
          naming_conventions, side_effect_boundaries,
          abstraction_boundaries, domain_rules } = policy;

  const layerBlock = layers.map(l => {
    const allowed = import_matrix[l.id] ?? [];
    const forbidden = l.forbidden_imports ?? [];
    const res = l.responsibilities;
    return [
      `### ${l.id.toUpperCase()}`,
      `  MAY IMPORT: ${allowed.length ? allowed.join(', ') : 'nothing'}`,
      forbidden.length ? `  MUST NOT IMPORT: ${forbidden.join(', ')}` : null,
      res ? `  RESPONSIBILITIES: ${res.owns.join(', ')}` : null,
      res ? `  MUST NOT DO: ${res.must_not.join(', ')}` : null,
      res?.depends_on_abstractions ? `  DEPENDS ON ABSTRACTIONS: YES (DIP enforced)` : null,
    ].filter(Boolean).join('\n');
  }).join('\n');

  const boundaryBlock = abstraction_boundaries?.map(b => 
    `### Boundary: ${b.boundary_name}\n  Inner: ${b.inner_layer}, Outer: ${b.outer_layer}\n  Interface Required: ${b.interface_required} at ${b.interface_location}\n  Forbidden leakage: ${b.forbidden_leakage.join(', ')}`
  ).join('\n');

  return [
    `# ARCHITECTURAL POLICY`,
    `# Version: ${meta.version} | Generated: ${meta.generated_at}`,
    ``,
    `## STACK`,
    `Domain: ${stack.domain} | Pattern: ${stack.pattern} | State: ${stack.state_philosophy}`,
    ``,
    `## LAYER ARCHITECTURE`,
    layerBlock,
    ``,
    abstraction_boundaries?.length ? `## ABSTRACTION BOUNDARIES\n${boundaryBlock}\n` : null,
    domain_rules ? `## DOMAIN RULES\n  Entities: ${domain_rules.entities_location}\n  Validation: ${domain_rules.entity_rules.validation_location}\n  Immutable: ${domain_rules.entity_rules.must_be_immutable}\n  Ubiquitous Language: ${domain_rules.ubiquitous_language.enforced}\n` : null,
    `## EXPECTED STRUCTURE`,
    `  ${renderCompactStructure(policy)}`,
    `## FILE CONVENTIONS`,
    ...flattenFileConventions(file_conventions).map(line => `  ${line}`),
    `Colocation policy: ${file_conventions.colocation}`,
    `Test placement: ${file_conventions.test_placement}`,
    ``,
    `## NAMING CONVENTIONS`,
    ...Object.entries(naming_conventions).map(([k, v]) => `${k}: ${v}`),
  ].filter(v => v !== null).join('\n');
};

// ─── Public API ───────────────────────────────────────────────────────────────
export interface RenderResult {
  content: string;
  tokens: number;
}

export const renderPrompt = (policy: Policy): RenderResult => {
  const mode: RenderMode = policy.meta.output_mode;
  let rendered = '';
  switch (mode) {
    case 'compact':  rendered = renderCompact(policy); break;
    case 'verbose':  rendered = renderVerbose(policy); break;
    case 'balanced':
    default:         rendered = renderBalanced(policy); break;
  }

  const tokens = Math.ceil(rendered.length / 4);
  
  return { content: rendered, tokens };
};
