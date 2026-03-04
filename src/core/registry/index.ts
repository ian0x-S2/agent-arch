import type { Policy } from '../../schema/policy.schema';
import { featureSlicedTemplate } from './templates/feature-sliced';
import { flatTemplate } from './templates/flat';
import { modularTemplate } from './templates/modular';
import { atomicTemplate } from './templates/atomic';
import { loadTemplateFromFile } from './loader';

let TEMPLATES: Record<string, Policy> = {
  'feature-sliced': featureSlicedTemplate,
  'flat': flatTemplate,
  'modular': modularTemplate,
  'atomic': atomicTemplate,
};

export const TemplateRegistry = {
  getTemplate: (id: string): Policy => {
    const template = TEMPLATES[id];
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  },
  listTemplates: (): string[] => {
    return Object.keys(TEMPLATES);
  },
  registerTemplate: (id: string, template: Policy): void => {
    // Allows overwriting existing templates (useful for re-imports)
    TEMPLATES[id] = template;
  },

  loadFromFile: (filePath: string): void => {
    const { id, template } = loadTemplateFromFile(filePath);
    TemplateRegistry.registerTemplate(id, template);
  },

  reset: (): void => {
    // Resets to built-in templates only. Useful for tests.
    TEMPLATES = {
      'feature-sliced': featureSlicedTemplate,
      'flat': flatTemplate,
      'modular': modularTemplate,
      'atomic': atomicTemplate,
    };
  },
};
