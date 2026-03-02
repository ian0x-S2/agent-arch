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

  // Write Source of Truth
  await fs.writeJson(policyJsonPath, policy, { spaces: 2 });

  // Write Prompt (The Agent interface) - Needs to be before MD to update token_metadata
  const promptContent = renderPrompt(policy);
  await fs.writeFile(promptTxtPath, promptContent);

  // Write Markdown (The UI/Human interface)
  const mdContent = renderMarkdown(policy);
  await fs.writeFile(policyMdPath, mdContent);

  return {
    policyMdPath,
    promptTxtPath,
    policyJsonPath
  };
};
