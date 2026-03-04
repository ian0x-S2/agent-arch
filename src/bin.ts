#!/usr/bin/env bun
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/app';

const program = new Command();

program
  .name('agent-arch')
  .description('Generate architecture policy for AI agents')
  .version('1.0.0');

program
  .command('init')
  .description('Interactive wizard to generate policy.md')
  .action(() => {
    render(React.createElement(App));
  });

program.parse();
