import type { Policy } from '../../schema/policy.schema';

const FILE_SUFFIXES: Record<string, Record<string, string>> = {
  'kebab-case': {
    component: '*.component.svelte',
    hook:      '*.hook.svelte.ts',
    store:     '*.store.svelte.ts',
    service:   '*.service.ts',
    types:     '*.types.ts',
    constants: '*.constants.ts',
  },
  'PascalCase': {
    component: '*Component.svelte',
    hook:      '*Hook.svelte.ts',
    store:     '*Store.svelte.ts',
    service:   '*Service.ts',
    types:     '*Types.ts',
    constants: '*Constants.ts',
  },
  'snake_case': {
    component: '*_component.svelte',
    hook:      '*_hook.svelte.ts',
    store:     '*_store.svelte.ts',
    service:   '*_service.ts',
    types:     '*_types.ts',
    constants: '*_constants.ts',
  },
  'camelCase': {
    component: '*.component.svelte',
    hook:      '*.hook.svelte.ts',
    store:     '*.store.svelte.ts',
    service:   '*.service.ts',
    types:     '*.types.ts',
    constants: '*.constants.ts',
  },
};

export const VALID_STRATEGIES = ['kebab-case', 'PascalCase', 'snake_case', 'camelCase'] as const;
export type NamingStrategy = typeof VALID_STRATEGIES[number];

export const resolveNamingPatterns = (
  types: Policy['file_conventions']['types'],
  strategy: string
): Policy['file_conventions']['types'] => {
  const suffixes = FILE_SUFFIXES[strategy];
  if (!suffixes) {
    throw new Error(`Unknown naming strategy: "${strategy}". Valid: ${VALID_STRATEGIES.join(', ')}`);
  }

  const result = JSON.parse(JSON.stringify(types));
  
  for (const key of Object.keys(result)) {
    if (suffixes[key]) {
      result[key].pattern = suffixes[key];
    }
  }
  
  return result;
};
