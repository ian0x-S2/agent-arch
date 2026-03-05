import { readFileSync } from 'fs';
import { estimateTokens, formatTokenCount } from '../core/token';

export const estimateAction = (filePath: string) => {
  try {
    if (!filePath.endsWith('.md')) {
      console.warn('WARNING: Estimating tokens from non-Markdown files is not recommended.');
    }
    const content = readFileSync(filePath, 'utf8');
    const tokens = estimateTokens(content);
    console.log(`Estimated prompt tokens: ${formatTokenCount(tokens)}`);
  } catch (error) {
    console.error(`✖ Estimate failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
