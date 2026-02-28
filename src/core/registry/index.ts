import type { Policy } from '../../schema/policy.schema';
import featureSlicedTemplate from './templates/feature-sliced.json';
import flatTemplate from './templates/flat.json';
import modularTemplate from './templates/modular.json';

export const TEMPLATES: Record<string, Policy> = {
  'feature-sliced': featureSlicedTemplate as unknown as Policy,
  'flat': flatTemplate as unknown as Policy,
  'modular': modularTemplate as unknown as Policy,
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
