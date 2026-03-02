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
  .action(() => {
    render(React.createElement(App));
  });

program.parse(process.argv);
