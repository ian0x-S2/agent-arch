import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';
import { renderPrompt } from '../renderer/prompt-renderer';

export const writePolicyFiles = async (policy: Policy, targetDir: string = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');

  // We still need to calculate tokens for metadata, but we won't write the prompt file.
  const { tokens } = renderPrompt(policy);
  
  const policyWithTokens: Policy = {
    ...policy,
    token_metadata: {
      ...policy.token_metadata,
      estimated_prompt_tokens: tokens,
    }
  };

  const mdContent = renderMarkdown(policyWithTokens);
  await fs.writeFile(policyMdPath, mdContent);

  return {
    policyMdPath,
    mdContent,
  };
};
