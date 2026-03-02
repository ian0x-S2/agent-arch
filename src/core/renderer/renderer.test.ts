import { describe, test, expect } from 'bun:test';
import { featureSlicedTemplate } from '../registry/templates/feature-sliced';
import { modularTemplate } from '../registry/templates/modular';
import { flatTemplate } from '../registry/templates/flat';
import { atomicTemplate } from '../registry/templates/atomic';
import { renderMarkdown } from './markdown-renderer';
import { renderPrompt } from './prompt-renderer';

describe('Markdown Renderer', () => {
  test('FSD balanced output matches snapshot', () => {
    const output = renderMarkdown(featureSlicedTemplate);
    expect(output).toMatchSnapshot();
  });

  test('Modular balanced output matches snapshot', () => {
    const output = renderMarkdown(modularTemplate);
    expect(output).toMatchSnapshot();
  });

  test('Flat balanced output matches snapshot', () => {
    const output = renderMarkdown(flatTemplate);
    expect(output).toMatchSnapshot();
  });

  test('Atomic balanced output matches snapshot', () => {
    const output = renderMarkdown(atomicTemplate);
    expect(output).toMatchSnapshot();
  });
});

describe('Prompt Renderer', () => {
  test('FSD compact output renders without errors', () => {
    const output = renderPrompt(featureSlicedTemplate);
    expect(output.length).toBeGreaterThan(0);
  });

  test('FSD output contains key sections', () => {
    const output = renderPrompt(featureSlicedTemplate);
    expect(output).toContain('feature-sliced');
    expect(output).toContain('LAYERS');
  });
});
