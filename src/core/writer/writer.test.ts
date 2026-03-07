import { expect, test, describe, beforeEach, afterEach, spyOn } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { writePolicyFiles } from './index';
import { featureSlicedTemplate } from '../registry/templates/feature-sliced';

describe('writePolicyFiles', () => {
  const targetDir = './test-ai';

  beforeEach(async () => {
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
  });

  afterEach(async () => {
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
  });

  test('should write policy.md with correct content', async () => {
    const policy = { ...featureSlicedTemplate };
    const result = await writePolicyFiles(policy, targetDir);

    expect(result.policyMdPath).toBe(path.join(targetDir, 'policy.md'));
    expect(await fs.pathExists(result.policyMdPath)).toBe(true);

    const content = await fs.readFile(result.policyMdPath, 'utf8');
    expect(content).toContain('# Architecture Policy');
    expect(content).toContain('Pattern: **feature-sliced**');
  });

  test('should include token metadata in the policy object', async () => {
    const policy = { ...featureSlicedTemplate };
    await writePolicyFiles(policy, targetDir);
    
    expect(policy.token_metadata.estimated_prompt_tokens).toBeGreaterThan(0);
  });
});
