import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';
import { TemplateRegistry } from '../registry';

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

  // Dynamically update file naming patterns in policy.file_conventions.types
  for (const [type, def] of Object.entries(policy.file_conventions.types as any)) {
    let pattern = (def as any).pattern;
    
    if (namingStrategy === 'PascalCase') {
      pattern = pattern.replace('.component.', 'Component.');
      pattern = pattern.replace('.hook.', 'Hook.');
      pattern = pattern.replace('.store.', 'Store.');
      pattern = pattern.replace('.service.', 'Service.');
      pattern = pattern.replace('.types.', 'Types.');
      pattern = pattern.replace('.constants.', 'Constants.');
    } else if (namingStrategy === 'snake_case') {
      pattern = pattern.replace('.component.', '_component.');
      pattern = pattern.replace('.hook.', '_hook.');
      pattern = pattern.replace('.store.', '_store.');
      pattern = pattern.replace('.service.', '_service.');
      pattern = pattern.replace('.types.', '_types.');
      pattern = pattern.replace('.constants.', '_constants.');
    } else {
      pattern = pattern.replace('Component.', '.component.');
      pattern = pattern.replace('Hook.', '.hook.');
      pattern = pattern.replace('_component.', '.component.');
      pattern = pattern.replace('_hook.', '.hook.');
    }
    
    (def as any).pattern = pattern;
  }

  // 5. Pattern-specific overrides
  if (selections.pattern === 'flat') {
    policy.structural_constraints.barrel_exports_required = false;
  }

  // 6. Validate the final object
  return v.parse(PolicySchema, policy);
};
