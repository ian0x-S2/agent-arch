import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns } from './naming';

export interface UserSelections {
  pattern: string;
  output_mode: 'compact' | 'balanced' | 'verbose';
  naming_strategy: 'kebab-case' | 'PascalCase' | 'snake_case';
  styling_strategy?: string;
}

const STATE_BY_PATTERN: Record<string, { philosophy: string; scope: string }> = {
  'feature-sliced': { philosophy: 'feature-based', scope: 'feature-based' },
  'modular':        { philosophy: 'module-based',  scope: 'module-based'  },
  'flat':           { philosophy: 'flexible',      scope: 'any'           },
  'atomic':         { philosophy: 'minimal',       scope: 'minimal'       },
};

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

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export const composePolicy = (selections: UserSelections): Policy => {
  // 1. Get base template (clone to avoid mutation)
  const template = deepClone(TemplateRegistry.getTemplate(selections.pattern));
  
  // 2. Derivar state da arch — não do input do usuário
  const state = STATE_BY_PATTERN[selections.pattern] ?? {
    philosophy: 'flexible',
    scope: 'any',
  };

  // 3. Define overrides
  const overrides: any = {
    meta: {
      output_mode: selections.output_mode,
      generated_at: new Date().toISOString()
    },
    stack: {
      state_philosophy: state.philosophy,
      ...(selections.styling_strategy && { styling_strategy: selections.styling_strategy }),
    },
    state_constraints: {
      global_state_scope: state.scope,
    },
    naming_conventions: {
      global_strategy: selections.naming_strategy
    }
  };

  // 4. Merge base with overrides
  let merged = deepMerge(template, overrides);

  // 5. Update naming patterns based on strategy
  merged.file_conventions.types = resolveNamingPatterns(
    merged.file_conventions.types,
    selections.naming_strategy
  );

  // 6. Pattern-specific overrides
  if (selections.pattern === 'flat') {
    merged.structural_constraints.barrel_exports_required = false;
  }

  // 7. Styling-specific companion + extension overrides
  const styleExts = STYLING_EXTENSIONS[selections.styling_strategy ?? ''];

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
