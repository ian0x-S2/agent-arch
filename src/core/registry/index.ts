import type { Policy } from '../../schema/policy.schema';
import { featureSlicedTemplate } from './templates/feature-sliced';
import { flatTemplate } from './templates/flat';
import { modularTemplate } from './templates/modular';
import { atomicTemplate } from './templates/atomic';
import { loadTemplateFromFile } from './loader';

const TEMPLATES: Record<string, Policy> = Object.freeze({
  'feature-sliced': featureSlicedTemplate,
  'flat': flatTemplate,
  'modular': modularTemplate,
  'atomic': atomicTemplate,
});

/**
 * Central registry for architectural templates.
 * Allows retrieving, listing, and dynamically registering templates.
 */
export const TemplateRegistry = {
  /**
   * Retrieves a template by its ID.
   * @throws Error if template is not found.
   */
  getTemplate: (id: string): Policy => {
    const template = TEMPLATES[id];
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  },

  /**
   * Lists all currently registered template IDs.
   */
  listTemplates: (): string[] => {
    return Object.keys(TEMPLATES);
  },

  /**
   * Registers a new template.
   * @throws Error if a template with the same ID already exists.
   */
  registerTemplate: (id: string, template: Policy): void => {
    if (TEMPLATES[id]) {
      throw new Error(`Template already registered: ${id}`);
    }
    TEMPLATES[id] = template;
  },

  /**
   * Loads a template from a file and registers it.
   */
  loadFromFile: (filePath: string): void => {
    const { id, template } = loadTemplateFromFile(filePath);
    TemplateRegistry.registerTemplate(id, template);
  },

  /**
   * Resets the registry to only include the built-in templates.
   * Useful for cleaning up state between tests or dynamic reloads.
   */
  reset: (): void => {
    // Note: Since TEMPLATES is now frozen, this is a no-op
    // The registry is now immutable by design
    console.warn('Registry reset is deprecated - templates are now immutable');
  },
};

