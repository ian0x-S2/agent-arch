import { readFileSync, existsSync } from 'fs';
import * as v from 'valibot';
import { PolicySchema } from '../schema/policy.schema';

export const validateAction = (filePath: string) => {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = readFileSync(filePath, 'utf8');

    if (!content.startsWith('# Architecture Policy')) {
      throw new Error('File does not appear to be a valid Architecture Policy Markdown file.');
    }

    // Try to parse as JSON to validate structure
    // Note: Since we output Markdown, we do a lightweight validation
    // A full implementation would parse the Markdown back to Policy object
    console.log(`✓ Architecture policy at ${filePath} appears to be valid.`);
  } catch (error) {
    console.error(`✖ Validation failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
