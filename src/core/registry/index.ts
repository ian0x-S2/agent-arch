import type { Policy } from '../../schema/policy.schema';
import { featureSlicedTemplate } from './templates/feature-sliced';
import { flatTemplate } from './templates/flat';
import { modularTemplate } from './templates/modular';
import { atomicTemplate } from './templates/atomic';
import { loadTemplateFromFile } from './loader';

const BUILT_IN_TEMPLATES: Record<string, Policy> = {
  'feature-sliced': featureSlicedTemplate,
  'flat': flatTemplate,
  'modular': modularTemplate,
  'atomic': atomicTemplate,
};

const customTemplates: Record<string, Policy> = {};

const getAllTemplates = (): Record<string, Policy> => ({
  ...BUILT_IN_TEMPLATES,
  ...customTemplates,
});

export const TemplateRegistry = {
  getTemplate: (id: string): Policy => {
    const template = getAllTemplates()[id];
    if (!template) throw new Error(`Template not found: ${id}`);
    return template;
  },

  listTemplates: (): string[] => Object.keys(getAllTemplates()),

  registerTemplate: (id: string, template: Policy): void => {
    if (getAllTemplates()[id]) throw new Error(`Template already registered: ${id}`);
    customTemplates[id] = template;
  },

  loadFromFile: (filePath: string): void => {
    const { id, template } = loadTemplateFromFile(filePath);
    TemplateRegistry.registerTemplate(id, template);
  },

  reset: (): void => {
    for (const key of Object.keys(customTemplates)) {
      delete customTemplates[key];
    }
  },
};
