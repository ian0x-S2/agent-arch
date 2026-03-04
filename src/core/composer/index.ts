import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns, VALID_STRATEGIES } from './naming';
import { STATE_BY_PATTERN } from '../shared/pattern-state';

export interface UserSelections {
  pattern: string;
  output_mode: 'compact';
  naming_strategy: typeof VALID_STRATEGIES[number];
  styling_strategy?: string;
}

const VALID_STYLING = ['utility-first', 'scoped', 'css-in-js', 'any'] as const;

const STYLING_EXTENSIONS: Record<string, string[]> = {
  'scoped':       ['.module.css', '.css'],
  'css-in-js':    [],
  'utility-first': [],
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merges two objects. Arrays are replaced entirely by source (no concat).
 * Scalar overrides and nested object merges work recursively.
 */
function deepMerge(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) return source;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      output[key] = source[key]; // arrays: source always wins
    } else if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

export const composePolicy = (selections: UserSelections): Policy => {
  // Validate styling_strategy
  if (selections.styling_strategy && !VALID_STYLING.includes(selections.styling_strategy as any)) {
    throw new Error(`Invalid styling_strategy: "${selections.styling_strategy}". Valid: ${VALID_STYLING.join(', ')}`);
  }

  // 1. Get base template (clone to avoid mutation)
  const template = deepClone(TemplateRegistry.getTemplate(selections.pattern));
  
  // 2. Derivar state da arch — não do input do usuário
  const state = STATE_BY_PATTERN[selections.pattern] ?? {
    philosophy: template.stack.state_philosophy || 'flexible',
    scope: template.state_constraints?.global_state_scope || 'any',
  };

  const stylingStrategy = selections.styling_strategy || template.stack.styling_strategy || 'any';
  const namingStrategy = selections.naming_strategy || template.naming_conventions.global_strategy;

  // 3. Define overrides
  const overrides: any = {
    meta: {
      output_mode: 'compact' as 'compact',
      generated_at: new Date().toISOString()
    },
    stack: {
      pattern: selections.pattern,
      state_philosophy: state.philosophy,
      styling_strategy: stylingStrategy,
    },
    state_constraints: {
      global_state_scope: state.scope,
      derived_state_strategy: selections.pattern === 'flat' ? 'any' : 'selectors',
    },
    naming_conventions: {
      global_strategy: namingStrategy
    }
  };

  // 4. Merge base with overrides
  let merged = deepMerge(template, overrides);

  // 5. Update naming patterns based on strategy
  if (namingStrategy) {
    merged.file_conventions.types = resolveNamingPatterns(
      merged.file_conventions.types,
      namingStrategy
    );
  }

  // 6. Pattern-specific overrides
  if (selections.pattern === 'flat') {
    merged.structural_constraints.barrel_exports_required = false;
  }

  // 7. Styling-specific companion + extension overrides
  const styleExts = STYLING_EXTENSIONS[stylingStrategy];

  for (const typeDef of Object.values(merged.file_conventions.types) as any[]) {
    if (!typeDef.companions?.style) continue;

    if (!styleExts || styleExts.length === 0) {
      delete typeDef.companions.style;
    } else {
      typeDef.companions.style.required = true;
      typeDef.companions.style.extensions = styleExts;
    }
  }

  // 8. Update ui_constraints based on styling strategy
  if (selections.styling_strategy === 'css-in-js') {
    merged.ui_constraints.style_co_location = true;
    merged.ui_constraints.allowed_style_extensions = [];
  }

  if (selections.styling_strategy === 'scoped') {
    merged.ui_constraints.style_co_location = true;
    merged.ui_constraints.allowed_style_extensions = ['.module.css', '.css'];
  }

  if (selections.styling_strategy === 'utility-first') {
    merged.ui_constraints.style_co_location = false;
    merged.ui_constraints.allowed_style_extensions = [];
  }

  // 9. Validate the final object
  return v.parse(PolicySchema, merged);
};
