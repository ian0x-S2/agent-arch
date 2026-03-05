export const VALID_STYLING = ['utility-first', 'scoped', 'css-in-js', 'any'] as const;
export type StylingStrategy = typeof VALID_STYLING[number];

export const VALID_STRATEGIES = ['kebab-case', 'camelCase', 'PascalCase', 'snake_case'] as const;
export type NamingStrategy = typeof VALID_STRATEGIES[number];

export const STYLING_EXTENSIONS: Record<string, string[]> = {
  'scoped':       ['.module.css', '.css'],
  'css-in-js':    [],
  'utility-first': [],
};

export const PREFERENCE_MAP = {
  strict: 5,
  balanced: 7,
  relaxed: 10,
} as const;

export type ComponentPreference = keyof typeof PREFERENCE_MAP;
