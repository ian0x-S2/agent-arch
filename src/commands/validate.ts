import { readFileSync, existsSync } from 'fs';
import * as v from 'valibot';
import { PolicySchema } from '../schema/policy.schema';

const REQUIRED_SECTIONS = [
  '# Architecture Policy',
  '## Layer Rules',
  '## File Conventions',
  '## State & Async Rules',
];

export const validateAction = (filePath: string) => {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = readFileSync(filePath, 'utf8');

    const missing = REQUIRED_SECTIONS.filter(s => !content.includes(s));
    if (missing.length > 0) {
      throw new Error(
        `Missing required sections:\n${missing.map(s => `  - ${s}`).join('\n')}`
      );
    }

    console.log(`✓ Architecture policy at ${filePath} is valid.`);
  } catch (error) {
    console.error(`✖ Validation failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
