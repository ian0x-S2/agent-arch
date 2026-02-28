import type { Policy } from '../../schema/policy.schema';

const FILE_SUFFIXES: Record<string, Record<string, string>> = {
  'kebab-case': {
    component: '*.component.tsx',
    hook:      '*.hook.ts',
    store:     '*.store.ts',
    service:   '*.service.ts',
    types:     '*.types.ts',
    constants: '*.constants.ts',
  },
  'PascalCase': {
    component: '*Component.tsx',
    hook:      '*Hook.ts',
    store:     '*Store.ts',
    service:   '*Service.ts',
    types:     '*Types.ts',
    constants: '*Constants.ts',
  },
  'snake_case': {
    component: '*_component.tsx',
    hook:      '*_hook.ts',
    store:     '*_store.ts',
    service:   '*_service.ts',
    types:     '*_types.ts',
    constants: '*_constants.ts',
  },
};

export const resolveNamingPatterns = (
  types: Policy['file_conventions']['types'],
  strategy: string
): Policy['file_conventions']['types'] => {
  const suffixes = FILE_SUFFIXES[strategy] || FILE_SUFFIXES['kebab-case'];
  const result = JSON.parse(JSON.stringify(types));
  
  if (!suffixes) return result;

  for (const key of Object.keys(result)) {
    if (suffixes[key]) {
      result[key].pattern = suffixes[key];
    }
  }
  
  return result;
};
