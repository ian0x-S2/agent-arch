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
    if (typeName === 'types') return 'PascalCase (*Type | *Props suffix)';
    if (typeName === 'constants') return 'SCREAMING_SNAKE_CASE';
    if (typeName === 'utils') return 'camelCase';

    const namingKey = keyMap[typeName] || typeName;
    const convention = naming_conventions[namingKey];
    return typeof convention === 'string' ? convention : '—';
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
  const isRemote = side_effect_boundaries.async_pattern === 'remote-functions';

  if (layerId === 'pages' && segment === 'ui') {
    return 'route components only — compose widgets, no business logic';
  }
  if (layerId === 'entities' && segment === 'api') {
    return isRemote
      ? 'server data access — follow SvelteKit conventions (remote functions), map to domain types'
      : 'server data access — follow SvelteKit conventions (+page.server.ts), map to domain types';
  }
  if (layerId === 'features' && segment === 'api') {
    return isRemote
      ? 'server mutations — follow SvelteKit conventions (remote functions), never fetch() in component'
      : 'server mutations — follow SvelteKit conventions (actions), never fetch() in component';
  }
  if (layerId === 'entities' && segment === 'model') {
    return 'entity state (runes in .svelte.ts), types — pure business logic';
  }
  if (layerId === 'features' && segment === 'model') {
    return 'feature state (runes in .svelte.ts) — only for this feature';
  }

  const rules: Record<string, string> = {
    ui: `components — extract if template > 2 logical sections, ${ui_constraints.logic_in_components ? 'logic allowed' : 'no logic — extract to model'}`,
    model: `reactive state (runes in .svelte.ts), types — no side effects`,
    api: isRemote
      ? 'follow SvelteKit conventions — remote functions'
      : 'follow SvelteKit conventions — +page.server.ts or actions',
    lib: `pure utils — stateless, no imports from ui or model`,
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
  const { ui_constraints, structural_constraints, side_effect_boundaries } = policy;
  const isRemote = side_effect_boundaries.async_pattern === 'remote-functions';

  const serviceLines = isRemote
    ? [
      '│   │   ├── services/         # external I/O — RPC style endpoints',
      '│   │   │   #                   can be imported directly in components',
      '│   │   │   #                   $env/static/public allowed, private forbidden',
    ]
    : [
      '│   │   ├── services/         # external I/O only — never import in components directly',
      '│   │   │   #                   use SvelteKit load functions (+page.server.ts) as the entry point',
      '│   │   │   #                   $env/static/private allowed here, forbidden in components',
    ];

  return [
    'src/',
    '├── modules/',
    '│   ├── <module-name>/        # one per business capability',
    '│   │   ├── components/       # extract if template > 2 logical sections',
    '│   │   │   └── ComponentName.svelte',
    `│   │   │       # ${ui_constraints.logic_in_components ? 'logic allowed here' : 'no logic — use hooks/'}`,
    '│   │   ├── hooks/            # reactive logic and state modules (*.svelte.ts)',
    ...serviceLines,
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
  const { graduation_signals, side_effect_boundaries } = policy;
  const signals = graduation_signals;
  const isRemote = side_effect_boundaries.async_pattern === 'remote-functions';

  const serviceLine = isRemote
    ? '├── services/                 # external I/O — RPC endpoints, components may import'
    : '├── services/                 # external I/O only — consume via SvelteKit load functions';

  return [
    'src/',
    '├── components/               # all components live here',
    '│   └── ComponentName.svelte     # logic colocated — ok at this scale',
    '├── hooks/                    # reactive logic modules (*.svelte.ts)',
    serviceLine,
    '├── types/                    # shared types',
    '└── utils/                    # pure functions',
    '',
    signals
      ? `# graduation signals — consider migrating to ${signals.suggested_next_pattern || 'modular'} when:
#   > ${signals.component_count_threshold} components in /components
#   same data fetched in ${signals.duplicated_fetch_threshold}+ places`
      : '# graduation signals — consider migrating to modular when:',
  ].join('\n');
};

const renderAtomicStructure = (policy: Policy): string => {
  const { layers, stack, atomic_config } = policy;
  const totalLayers = layers.length;
  const hasStyleFile = !['utility-first'].includes(stack.styling_strategy ?? '');
  const layerInternals = atomic_config?.layer_internals;

  const layerLines = layers.flatMap((layer, i) => {
    const isLast = i === totalLayers - 1;
    const prefix = isLast ? '└──' : '├──';
    const childPrefix = isLast ? '    ' : '│   ';
    const internals = layerInternals?.[layer.id];

    let lines = [`${prefix} ${layer.id}/`];

    if (layer.id === 'pages') {
      lines.push(`${childPrefix}├── <route>/`);
      lines.push(`${childPrefix}│   └── PageName.svelte`);
    } else if (!['shared'].includes(layer.id)) {
      lines.push(`${childPrefix}├── <component>/`);
      lines.push(`${childPrefix}│   ├── ComponentName.svelte`);
      if (internals && internals.length > 0) {
        internals.forEach((internal, idx) => {
          const internalPrefix = idx === internals.length - 1 ? '└──' : '├──';
          lines.push(`${childPrefix}│   ${internalPrefix} ${internal}/`);
        });
      }
      if (hasStyleFile) {
        const stylePrefix = internals && internals.length > 0 ? '    ' : `${childPrefix}│   `;
        lines.push(`${stylePrefix}└── ComponentName.module.css`);
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

const renderUiLibStructure = (policy: Policy): string => {
  const cfg = policy.ui_lib_config;
  const ns = cfg?.compound_pattern.export_style === 'namespace';
  const isUtilityFirst = policy.stack.styling_strategy === 'utility-first';

  const contextFile = 'Button.context.svelte.ts  # shared $state for compound parts via Svelte Context';

  const tokensSection = isUtilityFirst
    ? ''
    : `├── tokens/
│   ├── color.tokens.ts
│   ├── spacing.tokens.ts
│   ├── typography.tokens.ts
│   └── index.ts            # re-exports all tokens
`;

  return [
    'src/',
    tokensSection + "├── primitives/",
    "│   ├── Box/",
    '│   │   ├── Box.svelte         # unstyled, polymorphic',
    "│   │   ├── Box.types.ts",
    "│   │   └── index.ts",
    "│   └── Text/",
    "├── components/",
    "│   ├── Button/",
    ns
      ? '│   │   ├── Button.svelte          # namespace: Button.Root, Button.Icon'
      : '│   │   ├── ButtonRoot.svelte      # named exports',
    `│   │   ├── ${contextFile}`,
    "│   │   ├── Button.types.ts",
    '│   │   ├── Button.test.ts',
    "│   │   └── index.ts        # exports Button namespace",
    "├── patterns/",
    "│   ├── Form/",
    '│   │   ├── Form.svelte        # composes components',
    "│   │   └── index.ts",
    "└── index.ts                # package root — public API only",
  ].join('\n');
};

const renderDirectoryDepthNote = (policy: Policy): string => {
  if (policy.stack.pattern !== 'ui-lib') return '';

  const stateFile = '`*.context.svelte.ts`';

  return `\n> **Depth note:** max depth 3 is intentional — compound component state lives beside the component as ${stateFile}, never in a subdirectory. Context files are private to the component folder and must not be exported via \`index.ts\`.`;
};

const renderNamingHeader = (policy: Policy): string => {
  if (policy.stack.pattern === 'ui-lib') {
    return '> **Component files:** `PascalCase` · **Utility files:** `camelCase` · Symbols: per-type rules below';
  }
  return `> Files: \`${policy.naming_conventions.global_strategy}\` globally · Symbols: per-type rules below`;
};

const renderUiLibConfig = (policy: Policy): string => {
  const cfg = policy.ui_lib_config;
  if (!cfg) return '';

  const isUtilityFirst = policy.stack.styling_strategy === 'utility-first';
  const compoundNote = '\n> Svelte 5+: use `children: Snippet` + `$props()` rest spread. No `as` prop needed.';

  if (isUtilityFirst) {
    return `## UI Library Rules

### Design Tokens (Utility-First Mode)
- **Primary Source:** Tailwind/UnoCSS Config
- **Rule:** Use strictly Tailwind utility classes. Do NOT use arbitrary values.
- **Customization:** If a specific brand color is needed, add it to the config, not hardcoded in components.
- **Forbidden:** \`arbitrary-values-in-utils\` (e.g., \`text-[14px]\` → use \`text-sm\` instead)

### Compound Component Pattern
- **Enforced:** ${cfg.compound_pattern.enforced ? 'YES' : 'no'}
- **Export style:** \`${cfg.compound_pattern.export_style}\`
${cfg.compound_pattern.export_style === 'namespace'
        ? '- Exports as \`Button.Root\`, \`Button.Trigger\`, \`Button.Icon\`\n- Root component is the namespace object — never export parts standalone'
        : '- Exports as \`ButtonRoot\`, \`ButtonTrigger\` — each part is a named export'}${compoundNote}

### Publish Contract
- **package.json exports map:** required — every component gets its 
  own export path (\`"./button": "./src/components/Button/index.ts"\`)
- **Types exported:** YES — ship \`.d.ts\` alongside every component
- **Peer dependencies:** ${cfg.publish.peer_dependencies.join(', ')}
- **Never bundle peer deps** — consumers provide them

---
`;
  }

  // For scoped mode
  const tokenLocation = policy.stack.styling_strategy === 'scoped'
    ? '- **CSS Variables:** Expose tokens as `:root { --color-primary: #... }`'
    : '';

  return `## UI Library Rules

### Design Tokens
- **Categories:** ${cfg.token_categories.join(', ')}
- **Rule:** every visual value (color, spacing, radius) must reference 
  a token — no hardcoded values
- **Location:** \`tokens/\` layer — no framework imports allowed here
${tokenLocation}

### Compound Component Pattern
- **Enforced:** ${cfg.compound_pattern.enforced ? 'YES' : 'no'}
- **Export style:** \`${cfg.compound_pattern.export_style}\`
${cfg.compound_pattern.export_style === 'namespace'
      ? '- Exports as \`Button.Root\`, \`Button.Trigger\`, \`Button.Icon\`\n- Root component is the namespace object — never export parts standalone'
      : '- Exports as \`ButtonRoot\`, \`ButtonTrigger\` — each part is a named export'}${compoundNote}

### Publish Contract
- **package.json exports map:** required — every component gets its 
  own export path (\`"./button": "./src/components/Button/index.ts"\`)
- **Types exported:** YES — ship \`.d.ts\` alongside every component
- **Peer dependencies:** ${cfg.publish.peer_dependencies.join(', ')}
- **Never bundle peer deps** — consumers provide them

---
`;
};

const renderExpectedStructure = (policy: Policy): string => {
  const { stack } = policy;
  const pattern = stack.pattern;

  const renderers: Record<string, () => string> = {
    'feature-sliced': () => renderFSDStructure(policy),
    'modular': () => renderModularStructure(policy),
    'flat': () => renderFlatStructure(policy),
    'atomic': () => renderAtomicStructure(policy),
    'ui-lib': () => renderUiLibStructure(policy),
  };

  const renderer = renderers[pattern];
  if (!renderer) return '';

  return `## Expected Directory Structure

\`\`\`
${renderer()}
\`\`\`${renderDirectoryDepthNote(policy)}`;
};

const renderStackSection = (policy: Policy): string => {
  const { stack } = policy;

  const lines: string[] = ['## Stack'];
  lines.push(`- **Framework:** ${stack.framework}`);
  if (stack.component_lib) {
    lines.push(`- **Component Library:** ${stack.component_lib}`);
  }
  return lines.join('\n');
};

const getLogicExtractionTarget = (): string => {
  return '`*.svelte.ts` (Svelte logic module)';
};

const getLocalStatePrimitive = (): string => {
  return '`$state` rune';
};

const renderSvelteRunesGuide = (): string => {
  return `## Svelte 5 Runes Contract
- **\`$state\`** → local reactive state (avoid legacy \`let\` variables for state)
- **\`$derived\`** → computed values; replaces selectors and reactive declarations
- **\`$effect\`** → side effects only (DOM, subscriptions); **forbidden for syncing state**
- **\`$props\`** → official component interface; no more \`export let\`
- **\`$bindable\`** → explicit two-way binding; use sparingly to maintain data flow clarity`;
};

const renderStateSection = (policy: Policy): string => {
  if (policy.stack.pattern === 'ui-lib') {
    const statePrimitive = getLocalStatePrimitive();
    const forbiddenManagers = 'Svelte stores at module level';

    return `## State & Async Rules

- **Philosophy:** UI-only state — this library does NOT manage application state
- **Allowed:** component-internal UI state only (${statePrimitive}) — e.g. \`isOpen\`, \`isFocused\`, \`isDisabled\`
- **Compound component state sharing:** via scoped Context — never exposed outside the component boundary
- **FORBIDDEN:** global state managers (${forbiddenManagers})
- **FORBIDDEN:** fetching data or managing server state inside the library
- **FORBIDDEN:** sharing state between unrelated components via module-level variables
- **Props & callbacks** are the public contract — consumers own the state, the lib only reflects it
- **All promises must be handled** — no floating async calls
- **Every async UI operation requires** loading state + error state`;
  }

  const { state_constraints, side_effect_boundaries } = policy;

  const dataFetchingLine = (() => {
    const pattern = policy.stack.pattern;
    const strategy = side_effect_boundaries.async_pattern;

    if (pattern === 'feature-sliced') {
      if (strategy === 'remote-functions') {
        return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — via remote functions; never \`fetch()\` directly in components`;
      }
      return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — SvelteKit \`load\` functions (\`+page.server.ts\`, \`+page.ts\`); never \`fetch()\` directly in components`;
    }

    if (pattern === 'modular') {
      if (strategy === 'remote-functions') {
        return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — via remote functions; services are consumed directly in components through RPC-style calls`;
      }
      return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — via SvelteKit \`load\` functions; services are server-only, consumed through \`+page.server.ts\` not imported in components`;
    }

    if (pattern === 'flat') {
      if (strategy === 'remote-functions') {
        return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — via remote functions; services consumed directly in components`;
      }
      if (strategy === 'load-functions') {
        return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — SvelteKit \`load\` functions (\`+page.server.ts\`, \`+page.ts\`); never \`fetch()\` directly in components`;
      }
    }

    return `- **Data fetching:** ${side_effect_boundaries.data_fetching_scope} — pattern: ${side_effect_boundaries.async_pattern}`;
  })();

  return `## State & Async Rules
- **Scope:** ${state_constraints.global_state_scope}
- **Derived state:** ${state_constraints.derived_state_strategy}
${dataFetchingLine}
- **All promises must be handled** — no floating async calls
- **API errors must not reach UI raw** — map to domain error types in service layer
- **Every async UI operation requires** loading state + error state`;
};

const renderComponentRules = (policy: Policy): string => {
  const { ui_constraints } = policy;
  const logicTarget = getLogicExtractionTarget();

  if (policy.stack.pattern === 'ui-lib') {
    const maxProps = ui_constraints.component_max_props;
    const philosophy = maxProps <= 5
      ? 'Compound-first — visual variations become subcomponents, not props'
      : maxProps <= 10
        ? 'Hybrid — common variations as props, structural extensions as compound parts'
        : 'Config-driven — broad direct API, compound only for structural composition';

    const asPropRule = '- **Primitives accept `children: Snippet` and spread rest props via `$props()`** — the consumer controls wrapping; no \`as\` prop needed';

    return `## Component API Design Rules
- **API philosophy:** ${philosophy}
- **Max props per component:** ${maxProps} — split into compound parts if exceeded
- **Separate style props from behavior props** — \`variant\`, \`size\` are style; \`onClick\`, \`disabled\` are behavior
- **All props must be typed** — no \`[key: string]: any\` escape hatches
- **No prop drilling beyond depth ${ui_constraints.prop_drilling_max_depth}** — use scoped Context for compound internals
- **Logic in components:** FORBIDDEN — extract to ${logicTarget}
- **Prefer composition over configuration:** YES — pass children/slots, avoid boolean prop explosion
${asPropRule}`;
  }

  return `## Component Composition Rules
- **Complexity signal:** extract to a separate component when the template has more than 2 logical sections, not by line count
- **Logic signal:** extract to ${logicTarget} when script block exceeds ~20-25 lines
- **Max props:** ${ui_constraints.component_max_props} — split into compound component if exceeded
- **No prop drilling beyond depth ${ui_constraints.prop_drilling_max_depth}** — lift to store or context
- **Logic in components:** ${ui_constraints.logic_in_components ? 'allowed' : `FORBIDDEN — extract to ${logicTarget}`}
- **Presentational components** must not import from \`state\` or \`services\` layers
- **Prefer composition over configuration:** ${ui_constraints.prefer_composition ? 'YES — pass children/slots, avoid boolean prop explosion' : 'optional'}`;
};

/**
 * Renders the policy to official Markdown format.
 */
export const renderMarkdown = (policy: Policy): string => {
  const { stack, meta, structural_constraints, ui_constraints, state_constraints, file_conventions, side_effect_boundaries, domain_rules, naming_conventions } = policy;

  const stackSection = renderStackSection(policy);
  const logicTarget = getLogicExtractionTarget();
  const stateSection = renderStateSection(policy);
  const runesGuide = renderSvelteRunesGuide();

  return `# Architecture Policy
> Pattern: **${stack.pattern}** | State: **${stack.state_philosophy}** | Styling: **${stack.styling_strategy}**

---

${stackSection ? `${stackSection}\n\n---\n\n` : ''}## Layer Rules
Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted**.

${renderLayerTable(policy)}

${renderBoundariesTable(policy)}

**Cross-feature imports:** ${structural_constraints.cross_feature_imports.replace(/-/g, ' ')}
**Circular imports:** ${structural_constraints.circular_imports}${policy.cross_module_communication ? `\n**Cross-module communication:** ${policy.cross_module_communication.replace(/-/g, ' ')}` : ''}

---

${renderExpectedStructure(policy)}

---

${policy.ui_lib_config ? renderUiLibConfig(policy) : ''}${domain_rules ? `## Domain Rules
- **Entities location:** \`${domain_rules.entities_location}\`
- **Value objects:** ${domain_rules.value_objects_allowed ? 'allowed' : 'forbidden'}
- **Immutable entities:** ${domain_rules.entity_rules.must_be_immutable ? 'YES' : 'no'}
- **Framework-agnostic domain:** ${domain_rules.entity_rules.no_framework_imports ? 'YES' : 'no'}
- **Validation:** ${domain_rules.entity_rules.validation_location}
- **Anemic model:** ${domain_rules.anemic_model_allowed ? 'allowed' : 'FORBIDDEN — business logic belongs in entities'}
- **Ubiquitous Language:** ${domain_rules.ubiquitous_language.enforced ? 'enforced' : 'optional'}

---\n\n` : ''}## File Conventions

### Naming
${renderNamingHeader(policy)}

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

${renderComponentRules(policy)}

---

## Abstraction Rules
- Extract to **${logicTarget}** when: logic repeats across 2+ components OR exceeds 20-25 lines inside component
- Extract to **service** when: logic touches external I/O (API, storage, cookies)
- Extract to **utility** when: logic is pure, stateless, domain-agnostic
- **Do not abstract preemptively** — wrong abstraction costs more than duplication

---

${runesGuide}

---

${stateSection}

---

## Type Rules
- **No \`any\`** — use \`unknown\` + type narrowing
- **Props interface required** per component — no inline type literals
- **No type assertions (\`as\`)** except at data boundaries (API responses, DOM events)

---

*Generated by agent-arch · [edit templates to change rules]*`.trim();
};