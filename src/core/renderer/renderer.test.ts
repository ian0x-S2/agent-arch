import { describe, test, expect } from 'bun:test';
import { composePolicy } from '../composer';
import { renderMarkdown } from './markdown-renderer';

describe('Markdown Renderer', () => {
  test('FSD + utility-first compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Modular + utility-first compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'modular',
      output_mode: 'compact',
      naming_strategy: 'PascalCase',
      styling_strategy: 'utility-first',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Flat compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'flat',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Atomic + utility-first — no css files in structure or companions', () => {
    const policy = composePolicy({
      pattern: 'atomic',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
    });
    const output = renderMarkdown(policy);
    expect(output).toMatchSnapshot();
    expect(output).not.toContain('.module.css');
  });

  test('Atomic + scoped — css files appear in structure and companions', () => {
    const policy = composePolicy({
      pattern: 'atomic',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      styling_strategy: 'scoped',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('.module.css');
  });

  test('FSD + React + shadcn output contains Stack section', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
      framework: 'react',
      component_lib: 'shadcn',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Stack');
    expect(output).toContain('- **Framework:** react');
    expect(output).toContain('- **Component Library:** shadcn');
  });

  test('Vue framework applies Vue-specific rules', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      framework: 'vue',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('*.vue');
    expect(output).toContain('async-await');
  });

  test('Svelte framework applies Svelte-specific rules', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      framework: 'svelte',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('*.svelte');
    expect(output).toContain('*.svelte.ts'); // for both hook and store
    expect(output).toContain('*.test.ts');
    expect(output).not.toContain('*.test.tsx');
    expect(output).toContain('runes/logic functions');
  });
});

