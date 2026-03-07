import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';
import { estimateTokens } from '../token';

export const writePolicyFiles = async (policy: Policy, targetDir = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');
  const mdContent = renderMarkdown(policy);
  const tokens = estimateTokens(mdContent);

  // Atualiza metadata no objeto mas não re-renderiza
  policy.token_metadata.estimated_prompt_tokens = tokens;

  await fs.writeFile(policyMdPath, mdContent);

  return { policyMdPath, mdContent };
};
