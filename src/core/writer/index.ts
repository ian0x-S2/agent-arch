import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';
import { renderPrompt } from '../renderer/prompt-renderer';

export const writePolicyFiles = async (policy: Policy, targetDir: string = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');
  const promptTxtPath = path.join(targetDir, 'system.prompt.txt');
  const policyJsonPath = path.join(targetDir, 'policy.json');

  // Separate renders are intentional for modularity, although policy is immutable here.
  const { content: promptContent, tokens } = renderPrompt(policy);
  
  const policyWithTokens: Policy = {
    ...policy,
    token_metadata: {
      ...policy.token_metadata,
      estimated_prompt_tokens: tokens,
    }
  };

  await fs.writeJson(policyJsonPath, policyWithTokens, { spaces: 2 });
  await fs.writeFile(promptTxtPath, promptContent);

  const mdContent = renderMarkdown(policyWithTokens); // Use the policy with tokens
  await fs.writeFile(policyMdPath, mdContent);

  return {
    policyMdPath,
    promptTxtPath,
    policyJsonPath,
    mdContent,
    promptContent,
  };
};
