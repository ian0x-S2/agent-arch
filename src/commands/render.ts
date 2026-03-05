import { TemplateRegistry } from '../core/registry';
import { renderMarkdown } from '../core/renderer/markdown-renderer';

export const renderAction = (patternId: string) => {
  try {
    const template = TemplateRegistry.getTemplate(patternId);
    console.log(renderMarkdown(template));
  } catch (error) {
    console.error(`✖ Render failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
