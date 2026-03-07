export const VALID_STYLING = ['utility-first', 'scoped', 'any'] as const;
export type StylingStrategy = typeof VALID_STYLING[number];

export const VALID_STRATEGIES = ['kebab-case', 'camelCase', 'PascalCase', 'snake_case'] as const;
export type NamingStrategy = typeof VALID_STRATEGIES[number];

export const STYLING_EXTENSIONS: Record<string, string[]> = {
  'scoped':       ['.module.css', '.css'],
  'utility-first': [],
};

export const PREFERENCE_MAP = {
  strict: 5,
  balanced: 10,
  relaxed: 15,
} as const;

export const UI_LIB_PREFERENCE_MAP = {
  strict: { max_props: 5, label: 'Compound-first' },
  balanced: { max_props: 10, label: 'Hybrid' },
  relaxed: { max_props: 15, label: 'Config-driven' },
} as const;


export type ComponentPreference = keyof typeof PREFERENCE_MAP;
