import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns } from './naming';
import { STATE_BY_PATTERN } from '../shared/pattern-state';
import { FRAMEWORK_OVERRIDES } from '../shared/framework-rules';
import {
  VALID_STYLING,
  STYLING_EXTENSIONS,
  PREFERENCE_MAP,
  VALID_STRATEGIES
} from '../constants';
import type { UserSelections } from '../../types';

export const UserSelectionsSchema = v.object({
  pattern: v.string(),
  output_mode: v.union([v.literal('compact'), v.literal('balanced'), v.literal('verbose')]),
  naming_strategy: v.picklist(VALID_STRATEGIES),
  styling_strategy: v.optional(v.picklist(VALID_STYLING)),
  framework: v.optional(v.union([v.literal('react'), v.literal('vue'), v.literal('svelte')])),
  component_lib: v.optional(v.string()),
  component_preference: v.optional(v.picklist(['strict', 'balanced', 'relaxed'] as const)),
});

function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merges two objects. 
 * - Objects are merged recursively.
 * - Arrays are replaced entirely by the source array (no concatenation).
 * - Scalars are replaced by the source.
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

export const composePolicy = (rawSelections: Partial<UserSelections>): Policy => {
  // Validate UserSelections
  const selections = v.parse(UserSelectionsSchema, rawSelections);

  // 1. Get base template (clone to avoid mutation)
  const template = deepClone(TemplateRegistry.getTemplate(selections.pattern));

  // 2. Derive state from pattern
  const state = STATE_BY_PATTERN[selections.pattern] ?? {
    philosophy: template.stack.state_philosophy || 'flexible',
    scope: template.state_constraints?.global_state_scope || 'any',
  };

  const stylingStrategy = selections.styling_strategy || template.stack.styling_strategy || 'any';
  const namingStrategy = selections.naming_strategy || template.naming_conventions.global_strategy;

  // 3. Define overrides
  const overrides: any = {
    meta: {
      output_mode: selections.output_mode,
      generated_at: new Date().toISOString()
    },
    stack: {
      pattern: selections.pattern,
      state_philosophy: state.philosophy,
      styling_strategy: stylingStrategy,
      framework: selections.framework,
      component_lib: selections.component_lib || undefined,
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

  // Apply framework overrides
  if (selections.framework) {
    const frameworkOverride = FRAMEWORK_OVERRIDES[selections.framework];
    if (frameworkOverride) {
      merged = deepMerge(merged, frameworkOverride);
    }
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

  if (selections.component_preference) {
    merged.ui_constraints.component_max_props = PREFERENCE_MAP[selections.component_preference];
  }

  // 9. Validate the final object
  return v.parse(PolicySchema, merged);
};

