import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns } from './naming';

export interface UserSelections {
  pattern: string;
  output_mode: 'compact' | 'balanced' | 'verbose';
  naming_strategy: 'kebab-case' | 'PascalCase' | 'snake_case';
  state_philosophy?: string;
  styling_strategy?: string;
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
  // 1. Get base template
  const template = TemplateRegistry.getTemplate(selections.pattern);
  
  // 2. Define overrides
  const overrides: any = {
    meta: {
      output_mode: selections.output_mode,
      generated_at: new Date().toISOString()
    },
    stack: {
      ...(selections.state_philosophy && { state_philosophy: selections.state_philosophy }),
      ...(selections.styling_strategy && { styling_strategy: selections.styling_strategy }),
    },
    naming_conventions: {
      global_strategy: selections.naming_strategy
    }
  };

  // 3. Merge base with overrides
  let merged = deepMerge(template, overrides);

  // 4. Update naming patterns based on strategy
  merged.file_conventions.types = resolveNamingPatterns(
    merged.file_conventions.types,
    selections.naming_strategy
  );

  // 5. Pattern-specific overrides
  if (selections.pattern === 'flat') {
    merged.structural_constraints.barrel_exports_required = false;
  }

  // 6. Validate the final object
  return v.parse(PolicySchema, merged);
};
