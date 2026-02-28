import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';
import { resolveNamingPatterns } from './naming';

export interface UserSelections {
  pattern: string;
  enforcement: 'strict' | 'moderate' | 'relaxed';
  output_mode: 'compact' | 'balanced' | 'verbose';
  naming_strategy: 'kebab-case' | 'PascalCase' | 'snake_case';
  state_philosophy?: string;
  styling_strategy?: string;
}

export const composePolicy = (selections: UserSelections): Policy => {
  // 1. Get base template
  const template = TemplateRegistry.getTemplate(selections.pattern);
  
  // 2. Deep clone to avoid mutating registry
  const policy: any = JSON.parse(JSON.stringify(template));

  // 3. Apply user overrides
  policy.meta.enforcement = selections.enforcement;
  policy.meta.output_mode = selections.output_mode;
  policy.meta.generated_at = new Date().toISOString();

  if (selections.state_philosophy) {
    policy.stack.state_philosophy = selections.state_philosophy;
  }
  if (selections.styling_strategy) {
    policy.stack.styling_strategy = selections.styling_strategy;
  }

  // 4. Update naming patterns based on strategy
  const namingStrategy = selections.naming_strategy;
  policy.naming_conventions.global_strategy = namingStrategy;

  // Use robust resolution instead of fragile string replaces
  policy.file_conventions.types = resolveNamingPatterns(
    policy.file_conventions.types,
    namingStrategy
  );

  // 5. Pattern-specific overrides
  if (selections.pattern === 'flat') {
    policy.structural_constraints.barrel_exports_required = false;
  }

  // 6. Validate the final object
  return v.parse(PolicySchema, policy);
};
