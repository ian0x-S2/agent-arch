#!/usr/bin/env bun
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/app';

import fs from 'fs-extra';
import { scaffoldStructure } from './core/scaffolder';

import * as v from 'valibot';
import { PolicySchema } from './schema/policy.schema';

const program = new Command();

program
  .name('agent-arch')
  .description('Opinionated architecture governance for AI agents')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize architecture policy for the project')
  .action(() => {
    render(React.createElement(App));
  });

program
  .command('generate')
  .description('Generate directory structure based on current policy')
  .option('-d, --dir <dir>', 'Base directory for the structure', 'src')
  .action(async (options) => {
    try {
      const policyPath = '.ai/policy.json';
      if (!(await fs.pathExists(policyPath))) {
        console.error('Error: .ai/policy.json not found. Run "agent-arch init" first.');
        process.exit(1);
      }
      const policy = await fs.readJson(policyPath);
      // Validate policy
      const validated = v.parse(PolicySchema, policy);
      await scaffoldStructure(validated, options.dir);
    } catch (err) {
      console.error('Error during generation:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse(process.argv);
