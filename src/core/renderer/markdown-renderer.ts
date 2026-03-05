import type { Policy } from '../../schema/policy.schema';

const renderLayerTable = (policy: Policy): string => {
  const { layers, import_matrix, side_effect_boundaries } = policy;
  
  let table = '| Layer | May Import | Responsibilities | Side Effects |\n';
  table += '|-------|------------|------------------|--------------|\n';
  
  layers.forEach(layer => {
    const mayImport = import_matrix[layer.id]?.join(', ') || '—';
    const isAllowed = side_effect_boundaries.allowed_in_layers.includes(layer.id);
    const sideEffect = isAllowed ? '✓ allowed' : '✗ forbidden';
    const res = layer.responsibilities ? `**Owns:** ${layer.responsibilities.owns.join(', ')}<br>**Not:** ${layer.responsibilities.must_not.join(', ')}` : '—';
    table += `| ${layer.id} | ${mayImport} | ${res} | ${sideEffect} |\n`;
  });
  
  return table;
};

const renderNamingTable = (policy: Policy): string => {
  const { file_conventions, naming_conventions } = policy;
  
  let table = '| Type | File Pattern | Export Name Convention |\n';
  table += '|------|--------------|------------------------|\n';
  
  const keyMap: Record<string, string> = {
    types: 'type',
    constants: 'constant',
    store: 'store',
    service: 'service',
    hook: 'hook',
    component: 'component',
  };
  
  const getNamingConvention = (typeName: string): string => {
    if (typeName === 'types')     return 'PascalCase (*Type | *Props suffix)';
    if (typeName === 'constants') return 'SCREAMING_SNAKE_CASE';
    if (typeName === 'utils')     return 'camelCase';
    
    const namingKey = keyMap[typeName] || typeName;
    return naming_conventions[namingKey] || '—';
  };
  
  Object.entries(file_conventions.types).forEach(([typeName, def]) => {
    const symbolConv = getNamingConvention(typeName);
    table += `| ${typeName} | \`${def.pattern}\` | \`${symbolConv}\` |\n`;
  });
  
  return table;
};

const renderCompanionsTable = (policy: Policy): string => {
  const { file_conventions } = policy;
  
  let table = '| File Type | Required | Optional |\n';
  table += '|-----------|----------|----------|\n';
  
  Object.entries(file_conventions.types).forEach(([typeName, def]) => {
    if (!def.companions || Object.keys(def.companions).length === 0) {
      table += `| ${typeName} | — | — |\n`;
      return;
    }

    const companionEntries = Object.entries(def.companions);

    const required = companionEntries
      .filter(([_, rule]) => rule.required)
      .map(([_, rule]) => `\`*${rule.extensions[0]}\``)
      .join(' + ') || '—';
      
    const optional = companionEntries
      .filter(([_, rule]) => !rule.required)
      .map(([_, rule]) => `\`*${rule.extensions[0]}\``)
      .join(', ') || '—';
      
    table += `| ${typeName} | ${required} | ${optional} |\n`;
  });
  
  return table;
};

const renderBoundariesTable = (policy: Policy): string => {
  const { abstraction_boundaries } = policy;
  if (!abstraction_boundaries?.length) return '';

  let table = '\n### Abstraction Boundaries\n\n';
  table += '| Boundary | Inner | Outer | Interface Required | Forbidden Leakage |\n';
  table += '|----------|-------|-------|--------------------|-------------------|\n';

  abstraction_boundaries.forEach(b => {
    table += `| ${b.boundary_name} | ${b.inner_layer} | ${b.outer_layer} | ${b.interface_required ? `✓ (${b.interface_location})` : '✗'} | ${b.forbidden_leakage.join(', ')} |\n`;
  });

  return table;
};

const getSegmentRules = (segment: string, layerId: string, policy: Policy): string => {
  const { ui_constraints, side_effect_boundaries } = policy;
  
  if (layerId === 'pages' && segment === 'ui') {
    return 'route components only — compose widgets, no business logic';
  }
  if (layerId === 'entities' && segment === 'api') {
    return 'data access for this entity — maps to domain types, no raw responses';
  }
  if (layerId === 'features' && segment === 'api') {
    return 'feature-specific mutations — calls entity api, never raw fetch';
  }
  if (layerId === 'entities' && segment === 'model') {
    return 'entity state, selectors, types — pure business logic';
  }
  if (layerId === 'features' && segment === 'model') {
    return 'feature state, selectors — only for this feature';
  }
  
  const rules: Record<string, string> = {
    ui:     `components — extract if template > 2 logical sections, ${ui_constraints.logic_in_components ? 'logic allowed' : 'no logic — extract to model'}`,
    model:  `store, selectors, types — no side effects`,
    api:    `data fetching — ${side_effect_boundaries.async_pattern}, map errors to domain types`,
    lib:    `pure utils — stateless, no imports from ui or model`,
    config: `constants, feature flags`,
  };
  
  return rules[segment] ?? '';
};

const renderFSDStructure = (policy: Policy): string => {
  const { layers, import_matrix, ui_constraints, structural_constraints, file_conventions } = policy;
  const { fsd_config } = policy;
  
  const lines: string[] = ['src/'];

  for (const layer of layers) {
    const allowed = import_matrix[layer.id] ?? [];
    const res = layer.responsibilities;

    lines.push(`├── ${layer.id}/`);
    lines.push(`│   # imports: [${allowed.join(', ') || 'none'}]`);
    
    if (res?.must_not?.length) {
      lines.push(`│   # must not: ${res.must_not[0]}`);
    }

    if (!['app', 'shared'].includes(layer.id)) {
      lines.push(`│   ├── <slice>/          # business domain unit`);
      
      const segments = fsd_config?.segments ?? ['ui', 'model', 'api', 'lib'];
      for (const seg of segments) {
        const segRules = getSegmentRules(seg, layer.id, policy);
        lines.push(`│   │   ├── ${seg}/`);
        if (segRules) lines.push(`│   │   │   # ${segRules}`);
      }
      
      if (structural_constraints.barrel_exports_required) {
        lines.push(`│   │   └── index.ts      # public api — only export what consumers need`);
      }
    }

    if (layer.id === 'shared') {
      lines.push(`│   ├── ui-kit/           # design system primitives`);
      lines.push(`│   ├── api/              # base http client, interceptors`);
      lines.push(`│   ├── lib/              # pure utils — no business logic`);
      lines.push(`│   └── types/            # global types only`);
    }
  }

  return lines.join('\n');
};

const renderModularStructure = (policy: Policy): string => {
  const { ui_constraints, structural_constraints, file_conventions } = policy;
  
  return [
    'src/',
    '├── modules/',
    '│   ├── <module-name>/        # one per business capability',
    '│   │   ├── components/       # extract if template > 2 logical sections',
    `│   │   │   └── ComponentName.tsx`,
    `│   │   │       # ${ui_constraints.logic_in_components ? 'logic allowed here' : 'no logic — use hooks/'}`,
    '│   │   ├── hooks/            # all logic lives here',
    '│   │   ├── services/         # external I/O only — API, storage',
    '│   │   ├── types/            # module-scoped types',
    structural_constraints.barrel_exports_required
      ? '│   │   └── index.ts          # public api — never import internals directly'
      : '│   │   └── (no barrel required)',
    '│   │   # cross-module imports: FORBIDDEN — use shared/',
    '├── shared/',
    '│   ├── ui/                   # design system, generic components',
    '│   ├── utils/                # pure functions — min 2 consumers to justify',
    '│   └── types/                # global contracts only',
  ].join('\n');
};

const renderFlatStructure = (policy: Policy): string => {
  return [
    'src/',
    '├── components/               # all components live here',
    '│   └── ComponentName.tsx     # logic colocated — ok at this scale',
    '├── hooks/                    # extract when logic repeats 2+ times',
    '├── services/                 # extract when touching external I/O',
    '├── types/                    # shared types',
    '└── utils/                    # pure functions',
    '',
    '# graduation signals — consider migrating pattern when:',
    '#   > 20 components in /components',
    '#   same data fetched in 3+ places',
    '#   2+ devs regularly conflicting on same files',
  ].join('\n');
};

const renderAtomicStructure = (policy: Policy): string => {
  const { layers, stack } = policy;
  const totalLayers = layers.length;
  const hasStyleFile = !['utility-first', 'css-in-js'].includes(stack.styling_strategy ?? '');
  
  const layerLines = layers.flatMap((layer, i) => {
    const isLast = i === totalLayers - 1;
    const prefix = isLast ? '└──' : '├──';
    const childPrefix = isLast ? '    ' : '│   ';
    
    let lines = [`${prefix} ${layer.id}/`];
    
    if (layer.id === 'pages') {
      lines.push(`${childPrefix}├── <route>/`);
      lines.push(`${childPrefix}│   └── PageName.tsx`);
    } else if (!['shared'].includes(layer.id)) {
      lines.push(`${childPrefix}├── <component>/`);
      lines.push(`${childPrefix}│   ├── ComponentName.tsx`);
      if (hasStyleFile) {
        lines.push(`${childPrefix}│   └── ComponentName.module.css`);
      }
    } else {
      lines.push(`${childPrefix}├── utils/`);
      lines.push(`${childPrefix}├── types/`);
      lines.push(`${childPrefix}└── theme/`);
    }
    
    return lines;
  });

  return ['src/', ...layerLines].join('\n');
};

const renderExpectedStructure = (policy: Policy): string => {
  const { stack } = policy;
  const pattern = stack.pattern;

  const renderers: Record<string, () => string> = {
    'feature-sliced': () => renderFSDStructure(policy),
    'modular':        () => renderModularStructure(policy),
    'flat':           () => renderFlatStructure(policy),
    'atomic':         () => renderAtomicStructure(policy),
  };

  const renderer = renderers[pattern];
  if (!renderer) return '';

  return `## Expected Directory Structure\n\n\`\`\`\n${renderer()}\n\`\`\``;
};

const renderStackSection = (policy: Policy): string => {
  const { stack } = policy;
  if (!stack.framework && !stack.component_lib) return '';

  const lines: string[] = ['## Stack'];
  if (stack.framework) lines.push(`- **Framework:** ${stack.framework}`);
  if (stack.component_lib) {
    lines.push(`- **Component Library:** ${stack.component_lib}`);
  }
  return lines.join('\n');
};

const getLogicExtractionTarget = (policy: Policy): string => {
  const { framework } = policy.stack;
  if (framework === 'svelte') return '`*.svelte.ts`';
  if (framework === 'vue') return 'composables';
  return 'hooks';
};

export const renderMarkdown = (policy: Policy): string => {
  const { stack, meta, structural_constraints, ui_constraints, state_constraints, file_conventions, side_effect_boundaries, domain_rules, naming_conventions } = policy;

  const stackSection = renderStackSection(policy);
  const logicTarget = getLogicExtractionTarget(policy);

  return `# Architecture Policy
> Pattern: **${stack.pattern}** | State: **${stack.state_philosophy}** | Styling: **${stack.styling_strategy}**

---

${stackSection ? `${stackSection}\n\n---\n\n` : ''}## Layer Rules
Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted**.

${renderLayerTable(policy)}

${renderBoundariesTable(policy)}

**Cross-feature imports:** ${structural_constraints.cross_feature_imports.replace(/-/g, ' ')}
**Circular imports:** ${structural_constraints.circular_imports}

---

${renderExpectedStructure(policy)}

---

${domain_rules ? `## Domain Rules
- **Entities location:** \`${domain_rules.entities_location}\`
- **Value objects:** ${domain_rules.value_objects_allowed ? 'allowed' : 'forbidden'}
- **Immutable entities:** ${domain_rules.entity_rules.must_be_immutable ? 'YES' : 'no'}
- **Framework-agnostic domain:** ${domain_rules.entity_rules.no_framework_imports ? 'YES' : 'no'}
- **Validation:** ${domain_rules.entity_rules.validation_location}
- **Anemic model:** ${domain_rules.anemic_model_allowed ? 'allowed' : 'FORBIDDEN — business logic belongs in entities'}
- **Ubiquitous Language:** ${domain_rules.ubiquitous_language.enforced ? 'enforced' : 'optional'}

---\n\n` : ''}## File Conventions

### Naming
> Files: \`${naming_conventions.global_strategy}\` globally · Symbols: per-type rules below

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
- **Complexity signal:** extract to a separate component when the template has more than 2 logical sections, not by line count
- **Logic signal:** extract to ${logicTarget} when script block exceeds ~20-25 lines
- **Max props:** ${ui_constraints.component_max_props} — split into compound component if exceeded
- **No prop drilling beyond depth ${ui_constraints.prop_drilling_max_depth}** — lift to store or context
- **Logic in components:** ${ui_constraints.logic_in_components ? 'allowed' : `FORBIDDEN — extract to ${logicTarget}`}
- **Presentational components** must not import from \`state\` or \`services\` layers
- **Prefer composition over configuration:** ${ui_constraints.prefer_composition ? 'YES — pass children/slots, avoid boolean prop explosion' : 'optional'}

---

## Abstraction Rules
- Extract to **${logicTarget}** when: logic repeats across 2+ components OR exceeds 20-25 lines inside component
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
