export const STATE_BY_PATTERN: Record<string, { philosophy: string; scope: string }> = {
  'feature-sliced': { philosophy: 'feature-based', scope: 'feature-based' },
  'modular':        { philosophy: 'module-based',  scope: 'module-based'  },
  'flat':           { philosophy: 'flexible',      scope: 'any'           },
  'atomic':         { philosophy: 'minimal',       scope: 'minimal'       },
};

export const STATE_DISPLAY_MAP: Record<string, string> = {
  'feature-sliced': 'feature-based',
  'modular': 'module-based',
  'flat': 'flexible',
  'atomic': 'minimal',
};
