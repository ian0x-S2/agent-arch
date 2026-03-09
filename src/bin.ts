#!/usr/bin/env bun
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/app';
import { generateAction } from './commands/generate';
import { validateAction } from './commands/validate';
import { renderAction } from './commands/render';
import { estimateAction } from './commands/estimate';
import { registryListAction } from './commands/registry';

const program = new Command();

program
  .name('agent-arch')
  .description('Generate architecture policy for AI agents (Markdown only)')
  .version('2.0.0');

program
  .command('init')
  .description('Interactive wizard to generate policy.md')
  .action(() => {
    render(React.createElement(App));
  });

program
  .command('generate')
  .description('Non-interactive generation using flags')
  .requiredOption('--pattern <pattern>', 'Architectural pattern (e.g., feature-sliced, modular, flat, atomic)')
  .requiredOption('--naming <strategy>', 'Naming strategy (kebab-case, camelCase, PascalCase, snake_case)')
  .option('--styling <strategy>', 'Styling strategy (utility-first, scoped, any)')
  .option('--component-lib <lib>', 'Component library')
  .option('--preference <pref>', 'Component preference (strict, balanced, relaxed)', 'balanced')
  .action((options) => {
    generateAction({
      pattern: options.pattern,
      naming_strategy: options.naming,
      styling_strategy: options.styling,
      component_lib: options.componentLib,
      component_preference: options.preference,
    });
  });

program
  .command('validate')
  .description('Validate an existing policy.md')
  .argument('[path]', 'Path to policy.md', '.ai/policy.md')
  .action((path) => {
    validateAction(path);
  });

program
  .command('render')
  .description('Render a pattern to the console')
  .argument('<patternId>', 'ID of the pattern to render (e.g., feature-sliced)')
  .action((patternId) => {
    renderAction(patternId);
  });

program
  .command('estimate')
  .description('Estimate token usage for a policy.md')
  .argument('[path]', 'Path to policy.md', '.ai/policy.md')
  .action((path) => {
    estimateAction(path);
  });

program
  .command('registry')
  .description('List registered templates')
  .command('list')
  .action(() => {
    registryListAction();
  });

program.parse();
