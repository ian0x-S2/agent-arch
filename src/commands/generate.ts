import { composePolicy } from '../core/composer';
import { writePolicyFiles } from '../core/writer';
import type { UserSelections } from '../types';
import * as v from 'valibot';
import { UserSelectionsSchema } from '../core/composer';

export const generateAction = async (options: Partial<UserSelections>) => {
  try {
    const selections = v.parse(UserSelectionsSchema, options);
    const policy = composePolicy(selections);
    await writePolicyFiles(policy);
    console.log('✓ Architecture policy generated successfully in .ai/policy.md');
  } catch (error) {
    console.error('✖ Error generating policy:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
