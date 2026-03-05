import { TemplateRegistry } from '../core/registry';

export const registryListAction = () => {
  const templates = TemplateRegistry.listTemplates();
  console.log('Available Architectural Patterns:');
  templates.forEach(t => console.log(`- ${t}`));
};
