import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';
import { estimateTokens } from '../token';

export const writePolicyFiles = async (policy: Policy, targetDir: string = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');

  // Render MD first to estimate tokens from the final artifact
  const mdContent = renderMarkdown(policy);
  const tokens = estimateTokens(mdContent);
  
  const policyWithTokens: Policy = {
    ...policy,
    token_metadata: {
      ...policy.token_metadata,
      estimated_prompt_tokens: tokens,
    }
  };

  // Re-render with updated token metadata if necessary, or just use the first render
  // For now, simple rewrite with estimated tokens is fine
  await fs.writeFile(policyMdPath, renderMarkdown(policyWithTokens));

  return {
    policyMdPath,
    mdContent,
  };
};
