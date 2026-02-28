import type { Policy } from '../../schema/policy.schema';

const renderLayerTable = (policy: Policy): string => {
  const { layers, import_matrix, side_effect_boundaries } = policy;
  
  let table = '| Layer | May Import | Side Effects |\n';
  table += '|-------|------------|--------------|\n';
  
  layers.forEach(layer => {
    const mayImport = import_matrix[layer.id]?.join(', ') || '—';
    const isAllowed = side_effect_boundaries.allowed_in_layers.includes(layer.id);
    const sideEffect = isAllowed ? '✓ allowed' : '✗ forbidden';
    table += `| ${layer.id} | ${mayImport} | ${sideEffect} |\n`;
  });
  
  return table;
};

const renderNamingTable = (policy: Policy): string => {
  const { file_conventions, naming_conventions } = policy;
  
  let table = '| Type | File Pattern | Export Name Convention |\n';
  table += '|------|--------------|------------------------|\n';
  
  Object.entries(file_conventions.types).forEach(([typeName, def]) => {
    const symbolConv = naming_conventions[typeName] || '—';
    table += `| ${typeName} | \`${def.pattern}\` | \`${symbolConv}\` |\n`;
  });
  
  return table;
};

const renderCompanionsTable = (policy: Policy): string => {
  const { file_conventions, stack } = policy;
  const isUtilityFirst = stack.styling_strategy.toLowerCase().includes('utility') || 
                         stack.styling_strategy.toLowerCase().includes('tailwind');
  
  let table = '| File Type | Required | Optional |\n';
  table += '|-----------|----------|----------|\n';
  
  Object.entries(file_conventions.types).forEach(([typeName, def]) => {
    if (!def.companions) {
      table += `| ${typeName} | — | — |\n`;
      return;
    }

    const filterStyles = (entries: [string, any][]) => 
      entries.filter(([key, rule]) => {
        if (isUtilityFirst && (key === 'style' || rule.extensions.some((e: string) => e.includes('css') || e.includes('scss') || e.includes('less')))) {
          return false;
        }
        return true;
      });
    
    const companionEntries = Object.entries(def.companions);
    const filteredEntries = filterStyles(companionEntries);

    const required = filteredEntries
      .filter(([_, rule]) => rule.required)
      .map(([_, rule]) => `\`*${rule.extensions[0]}\``)
      .join(' + ') || '—';
      
    const optional = filteredEntries
      .filter(([_, rule]) => !rule.required)
      .map(([_, rule]) => `\`*${rule.extensions[0]}\``)
      .join(', ') || '—';
      
    table += `| ${typeName} | ${required} | ${optional} |\n`;
  });
  
  return table;
};

export const renderMarkdown = (policy: Policy): string => {
  const { stack, meta, structural_constraints, ui_constraints, state_constraints, file_conventions, side_effect_boundaries } = policy;

  return `# Architecture Policy
> Pattern: **${stack.pattern}** | Enforcement: **${meta.enforcement}** | State: **${stack.state_philosophy}** | Styling: **${stack.styling_strategy}**

---

## Layer Rules
Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted** under ${meta.enforcement} enforcement.

${renderLayerTable(policy)}

**Cross-feature imports:** ${structural_constraints.cross_feature_imports.replace(/-/g, ' ')}
**Circular imports:** ${structural_constraints.circular_imports}

---

## File Conventions

### Naming
> Files: \`kebab-case\` globally · Symbols: per-type rules below

${renderNamingTable(policy)}

### Required Companions

${renderCompanionsTable(policy)}

### Structure Rules
- **Co-location:** ${file_conventions.colocation} — companions must live beside source file
- **Test placement:** ${file_conventions.test_placement}
- **Public API:** ${file_conventions.public_api.required ? `every feature root requires \`${file_conventions.public_api.filename || 'index'}.ts\` — internal files must not be imported directly` : 'optional'}
- **Max directory depth:** ${file_conventions.directory?.max_depth || 'N/A'}
- **Barrel exports:** ${structural_constraints.barrel_exports_required ? 'required at feature roots only' : 'optional'}

### Forbidden Patterns
${file_conventions.forbidden_patterns.map(p => `- \`${p}\``).join('\n')}

---

## Component Composition Rules
- **Max lines:** ${ui_constraints.component_max_lines}
- **Max props:** ${ui_constraints.component_max_props} — split into compound component if exceeded
- **No prop drilling beyond depth ${ui_constraints.prop_drilling_max_depth}** — lift to store or context
- **Logic in components:** ${ui_constraints.logic_in_components ? 'allowed' : 'FORBIDDEN — extract to hooks'}
- **Presentational components** must not import from \`state\` or \`services\` layers
- **Prefer composition over configuration:** ${ui_constraints.prefer_composition ? 'YES — pass children/slots, avoid boolean prop explosion' : 'optional'}

---

## Abstraction Rules
- Extract to **hook** when: logic repeats across 2+ components OR exceeds 20 lines inside component
- Extract to **service** when: logic touches external I/O (API, storage, cookies)
- Extract to **utility** when: logic is pure, stateless, domain-agnostic
- **Do not abstract preemptively** — wrong abstraction costs more than duplication

---

## State & Async Rules
- **Scope:** ${state_constraints.global_state_scope}
- **Derived state:** ${state_constraints.derived_state_strategy}
- **Data fetching:** ${side_effect_boundaries.data_fetching_scope}, consumed via hooks
- **All promises must be handled** — no floating async calls
- **API errors must not reach UI raw** — map to domain error types in service layer
- **Every async UI operation requires** loading state + error state

---

## Type Rules
- **No \`any\`** — use \`unknown\` + type narrowing
- **Props interface required** per component — no inline type literals
- **No type assertions (\`as\`)** except at data boundaries (API responses, DOM events)

---

*Generated by agent-arch · [edit templates to change rules]*
`.trim();
};
