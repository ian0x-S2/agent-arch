import { describe, test, expect } from 'bun:test';
import { composePolicy } from '../composer';
import { renderMarkdown } from './markdown-renderer';
import { renderPrompt } from './prompt-renderer';

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

  test('FSD + scoped — style companion required', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case',
      styling_strategy: 'scoped',
    });
    const output = renderMarkdown(policy);
    expect(output).toContain('.module.css');
  });
});

describe('Prompt Renderer', () => {
  test('FSD compact output renders without errors', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case'
    });
    const { content, tokens } = renderPrompt(policy);
    expect(content.length).toBeGreaterThan(0);
    expect(tokens).toBeGreaterThan(0);
  });

  test('FSD output contains key sections', () => {
    const policy = composePolicy({
      pattern: 'feature-sliced',
      output_mode: 'compact',
      naming_strategy: 'kebab-case'
    });
    const { content } = renderPrompt(policy);
    expect(content).toContain('feature-sliced');
    expect(content).toContain('LAYERS');
    expect(content).toContain('STRUCTURE');
  });
});
