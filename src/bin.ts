#!/usr/bin/env bun
import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/app';

import fs from 'fs-extra';
import { writePolicyFiles } from './core/writer';

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
  .command('render')
  .description('Re-run init to regenerate policy.md')
  .action(() => {
    console.log('ℹ️  Run `agent-arch init` to regenerate policy.md');
    console.log('   policy.md is the only output artifact.');
  });

program.parse(process.argv);
