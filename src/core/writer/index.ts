import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';
import { renderMarkdown } from '../renderer/markdown-renderer';

export const writePolicyFiles = async (policy: Policy, targetDir: string = '.ai') => {
  await fs.ensureDir(targetDir);

  const policyMdPath = path.join(targetDir, 'policy.md');

  // Write Markdown (The UI/Human interface)
  const mdContent = renderMarkdown(policy);
  await fs.writeFile(policyMdPath, mdContent);

  return {
    policyMdPath
  };
};
