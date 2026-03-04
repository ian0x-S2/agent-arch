#!/usr/bin/env bun
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/app';

const program = new Command();

program
  .name('agent-arch')
  .description('Opinionated architecture governance for AI agents')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize architecture policy for the project')
  .option('-t, --template <path>', 'Path to a custom JSON template file')
  .action(async (options) => {
    if (options.template) {
      // Load the custom template before launching the UI
      const { TemplateRegistry } = await import('./core/registry');
      TemplateRegistry.loadFromFile(options.template);
      console.log(`Custom template loaded from: ${options.template}`);
    }
    render(React.createElement(App));
  });

program.parse(process.argv);
