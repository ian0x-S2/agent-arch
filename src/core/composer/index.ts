import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns } from './naming';
import { STATE_BY_PATTERN } from '../shared/pattern-state';
import { SVELTE_OVERRIDES } from '../shared/framework-rules';
import {
  VALID_STYLING,
  STYLING_EXTENSIONS,
  PREFERENCE_MAP,
  UI_LIB_PREFERENCE_MAP,
  VALID_STRATEGIES
} from '../constants';
import type { UserSelections } from '../../types';

export const UserSelectionsSchema = v.object({
  pattern: v.string(),
  naming_strategy: v.optional(v.picklist(VALID_STRATEGIES)),
  styling_strategy: v.optional(v.picklist(VALID_STYLING)),
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
      output[key] = source[key]; // arrays: source always wins (except special cases handled later)
    } else if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

function mergeStringArrayUnique(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
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
      output_mode: 'compact',
      generated_at: new Date().toISOString()
    },
    stack: {
      pattern: selections.pattern,
      state_philosophy: state.philosophy,
      styling_strategy: stylingStrategy,
      framework: 'svelte' as const,
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
  const baseForbiddenFile = template.file_conventions.forbidden_patterns || [];
  const baseForbiddenState = template.state_constraints.forbidden_patterns || [];

  merged = deepMerge(merged, SVELTE_OVERRIDES);

  // Correct deepMerge for known arrays that should be merged (Task 2)
  merged.file_conventions.forbidden_patterns = mergeStringArrayUnique(
    baseForbiddenFile,
    merged.file_conventions.forbidden_patterns || []
  );

  merged.state_constraints.forbidden_patterns = mergeStringArrayUnique(
    baseForbiddenState,
    merged.state_constraints.forbidden_patterns || []
  );

  // Framework-specific peer dependencies for ui-lib pattern
  if (merged.ui_lib_config) {
    merged.ui_lib_config.publish.peer_dependencies = ['svelte'];
  }

  // ui-lib: always enforce PascalCase as the declared naming convention
  if (selections.pattern === "ui-lib") {
    merged.naming_conventions.global_strategy = "PascalCase";

    // ui-lib: utility files always use dot-separated convention (*.types.ts, *.constants.ts)
    // regardless of naming strategy — only component files follow PascalCase
    if (merged.file_conventions.types.types) {
      merged.file_conventions.types.types.pattern = "*.types.ts";
    }
    if (merged.file_conventions.types.constants) {
      merged.file_conventions.types.constants.pattern = "*.constants.ts";
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
  if (selections.styling_strategy === 'scoped') {
    merged.ui_constraints.style_co_location = true;
    merged.ui_constraints.allowed_style_extensions = ['.module.css', '.css'];
  }

  if (selections.styling_strategy === 'utility-first') {
    merged.ui_constraints.style_co_location = false;
    merged.ui_constraints.allowed_style_extensions = [];
  }

  // 8b. UI-Lib pattern-specific overrides based on styling strategy
  if (selections.pattern === 'ui-lib') {
    if (selections.styling_strategy === 'utility-first') {
      // Utility-first: Tailwind classes are the token source
      // Replace hardcoded-color rule with arbitrary-values rule
      merged.file_conventions.forbidden_patterns =
        merged.file_conventions.forbidden_patterns
          .map((p: string) => p === 'hardcoded-color-without-token'
            ? 'arbitrary-values-in-utils'
            : p)
          .filter((p: string) => p !== 'style-without-token-reference');
    }
    // For scoped: keep default token rules (hardcoded-color-without-token)
  }

  if (selections.component_preference) {
    merged.ui_constraints.component_max_props = selections.pattern === 'ui-lib'
      ? UI_LIB_PREFERENCE_MAP[selections.component_preference].max_props
      : PREFERENCE_MAP[selections.component_preference];
  }

  // ui-lib + utility-first: remove tokens layer and related config
  if (selections.pattern === 'ui-lib' && stylingStrategy === 'utility-first') {
    // 1. Remove tokens layer from policy.layers
    merged.layers = merged.layers.filter((layer: any) => layer.id !== 'tokens');

    // 2. Remove tokens from import_matrix entirely
    delete merged.import_matrix.tokens;

    // Also strip 'tokens' from the arrays of all remaining keys in import_matrix
    for (const key of Object.keys(merged.import_matrix)) {
      merged.import_matrix[key] = merged.import_matrix[key].filter(
        (id: string) => id !== 'tokens'
      );
    }

    // 3. Remove 'tokens' from allowed_imports arrays in primitives, components, and patterns
    merged.layers = merged.layers.map((layer: any) => ({
      ...layer,
      allowed_imports: layer.allowed_imports.filter((id: string) => id !== 'tokens'),
    }));

    // 4. Set ui_lib_config.token_categories to empty array (Tailwind config is the source of truth)
    if (merged.ui_lib_config) {
      merged.ui_lib_config.token_categories = [];
    }

    // 5. Remove token-related forbidden patterns
    if (merged.state_constraints?.forbidden_patterns) {
      merged.state_constraints.forbidden_patterns = merged.state_constraints.forbidden_patterns.filter(
        (pattern: string) => 
          pattern !== 'styles-hardcoded-without-token' && 
          pattern !== 'side-effects-in-tokens'
      );
    }

    // 6. Remove tokens file type from file_conventions.types
    delete merged.file_conventions.types.tokens;

    // 7. Remove 'tokens' from side_effect_boundaries layer lists
    merged.side_effect_boundaries.forbidden_in_layers =
      merged.side_effect_boundaries.forbidden_in_layers.filter(
        (id: string) => id !== 'tokens'
      );

    merged.side_effect_boundaries.allowed_in_layers =
      merged.side_effect_boundaries.allowed_in_layers.filter(
        (id: string) => id !== 'tokens'
      );
  }

  // 9. Validate the final object
  return v.parse(PolicySchema, merged);
};

