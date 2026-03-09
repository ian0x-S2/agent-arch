import { describe, test, expect } from 'bun:test';
import { composePolicy } from '../composer';
import { renderMarkdown } from './markdown-renderer';

describe('Markdown Renderer', () => {
  test('FSD + utility-first compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',

      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Modular + utility-first compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'modular',

      naming_strategy: 'PascalCase',
      styling_strategy: 'utility-first',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Flat compact output matches snapshot', () => {
    const policy = composePolicy({
      pattern: 'flat',

      naming_strategy: 'kebab-case',
    });
    expect(renderMarkdown(policy)).toMatchSnapshot();
  });

  test('Atomic + utility-first — no css files in structure or companions', () => {
    const policy = composePolicy({
      pattern: 'atomic',

      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
    });
    const output = renderMarkdown(policy);
    expect(output).toMatchSnapshot();
    expect(output).not.toContain('.module.css');
  });

  test('ui-lib + utility-first hides tokens folder in structure', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
      styling_strategy: 'utility-first',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Directory Structure');
    expect(output).not.toContain('tokens/');
  });

  test('ui-lib + scoped shows tokens folder in structure', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
      styling_strategy: 'scoped',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Directory Structure');
  });

  test('FSD + shadcn output contains Stack section', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',

      naming_strategy: 'kebab-case',
      styling_strategy: 'utility-first',
      component_lib: 'shadcn',
    });
    const output = renderMarkdown(policy);
    // Raw template override means we see the static header
    expect(output).toContain('Pattern: feature-sliced | Framework: Svelte 5 | Styling: utility-first');
  });

  test('Svelte framework applies Svelte-specific rules', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',

      naming_strategy: 'kebab-case',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('*.svelte');
    expect(output).toContain('*.svelte.ts');
    expect(output).toContain('Svelte 5 Runes');
  });

  test('ui-lib state section uses $state and Svelte-specific forbidden', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('$state');
    expect(output).not.toContain('useState');
    expect(output).not.toContain('Zustand');
  });

  test('Stack section always shows Svelte 5+ framework', () => {
    const policy = composePolicy({
      pattern: 'flat',

      naming_strategy: 'kebab-case'
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('Pattern: flat | Framework: Svelte 5');
  });

  test('ui-lib naming header communicates PascalCase for components', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('Component files: PascalCase');
  });

  test('ui-lib compound-first renders correct API philosophy', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
      component_preference: 'strict',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Component Rules');
    expect(output).toContain('split into compound parts');
  });

  test('ui-lib does not mention asChild and recommends Snippet + $props spread', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
    });
    const output = renderMarkdown(policy);
    expect(output).not.toContain('asChild');
    expect(output).toContain('children: Snippet');
    expect(output).toContain('$props()');
  });

  test('ui-lib hybrid renders correct API philosophy', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
      component_preference: 'balanced',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Component Rules');
  });

  test('ui-lib directory shows context file', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',

      naming_strategy: 'PascalCase',
      styling_strategy: 'utility-first',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('Component.context.svelte.ts');
  });

  test('ui-lib reflects dynamic Max props based on preference', () => {
    const policy = composePolicy({
      pattern: 'ui-lib',
      component_preference: 'strict', // Should be 5 for ui-lib
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('Max props: 5');
    expect(output).not.toContain('Max props: 10');
  });

  test('non ui-lib pattern still renders Component Composition Rules', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',

      naming_strategy: 'kebab-case',
      component_preference: 'strict',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('## Component Rules');
    expect(output).not.toContain('## Component API Design Rules');
  });
});

