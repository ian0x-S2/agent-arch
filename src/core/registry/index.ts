import type { Policy } from '../../schema/policy.schema';
import { featureSlicedTemplate } from './templates/feature-sliced';
import { flatTemplate } from './templates/flat';
import { modularTemplate } from './templates/modular';
import { atomicTemplate } from './templates/atomic';

export const TEMPLATES: Record<string, Policy> = {
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
  }
};
