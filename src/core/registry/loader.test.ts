import { describe, test, expect, beforeEach } from 'bun:test';
import { TemplateRegistry } from './index';

describe('TemplateRegistry external templates', () => {
  beforeEach(() => {
    TemplateRegistry.reset();
  });

  test('listTemplates returns built-in templates', () => {
    const list = TemplateRegistry.listTemplates();
    expect(list).toContain('feature-sliced');
    expect(list).toContain('flat');
    expect(list).toContain('modular');
    expect(list).toContain('atomic');
  });

  test('registerTemplate adds a new template', () => {
    const base = TemplateRegistry.getTemplate('flat');
    TemplateRegistry.registerTemplate('my-custom', { ...base, meta: { ...base.meta, version: '2.0.0' } });
    expect(TemplateRegistry.listTemplates()).toContain('my-custom');
  });

  test('registerTemplate throws on duplicate id', () => {
    const base = TemplateRegistry.getTemplate('flat');
    expect(() => TemplateRegistry.registerTemplate('flat', base)).toThrow('already registered');
  });

  test('reset removes custom templates and restores built-ins', () => {
    const base = TemplateRegistry.getTemplate('flat');
    TemplateRegistry.registerTemplate('temp-template', base);
    TemplateRegistry.reset();
    expect(TemplateRegistry.listTemplates()).not.toContain('temp-template');
    expect(TemplateRegistry.listTemplates()).toContain('flat');
  });

  test('loadFromFile throws if file does not exist', () => {
    expect(() => TemplateRegistry.loadFromFile('/nonexistent/path/template.json'))
      .toThrow('not found');
  });

  test('loadFromFile registers a valid template from disk', () => {
    const { tmpdir } = require('os');
    const { writeFileSync } = require('fs');
    const path = require('path');
    
    const base = TemplateRegistry.getTemplate('flat');
    const id = `my-team-${Date.now()}`;
    const tmpPath = path.join(tmpdir(), `${id}.json`);
    writeFileSync(tmpPath, JSON.stringify({ ...base, meta: { ...base.meta, version: '9.0.0' } }));
    
    TemplateRegistry.loadFromFile(tmpPath);
    expect(TemplateRegistry.listTemplates()).toContain(id);
    expect(TemplateRegistry.getTemplate(id).meta.version).toBe('9.0.0');
  });
});
