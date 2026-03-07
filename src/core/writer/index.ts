import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';
import { estimateTokens } from '../token';

export const writePolicyFiles = async (policy: Policy, targetDir = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');
  
  // Render first time to get token count
  const roughContent = renderMarkdown(policy);
  const tokens = estimateTokens(roughContent);
  
  // Update metadata
  policy.token_metadata.estimated_prompt_tokens = tokens;
  
  // Re-render with updated metadata
  const mdContent = renderMarkdown(policy);

  await fs.writeFile(policyMdPath, mdContent);

  return { policyMdPath, mdContent };
};
