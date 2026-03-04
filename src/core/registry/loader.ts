import fs from 'fs-extra';
import path from 'path';
import * as v from 'valibot';
import { PolicySchema, type Policy } from '../../schema/policy.schema';

/**
 * Loads a custom Policy template from a JSON file.
 * Validates the file against PolicySchema before registering.
 * Throws a descriptive error if the file is missing, invalid JSON, or fails schema validation.
 */
export const loadTemplateFromFile = (filePath: string): { id: string; template: Policy } => {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Custom template file not found: ${absolutePath}`);
  }

  let raw: unknown;
  try {
    raw = fs.readJsonSync(absolutePath);
  } catch {
    throw new Error(`Failed to parse JSON from template file: ${absolutePath}`);
  }

  // Derive the template id from the filename without extension
  const id = path.basename(absolutePath, path.extname(absolutePath));

  let template: Policy;
  try {
    template = v.parse(PolicySchema, raw);
  } catch (err) {
    throw new Error(`Template "${id}" failed schema validation: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { id, template };
};
