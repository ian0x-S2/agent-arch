import { expect, test, describe, beforeEach, afterEach, spyOn, jest } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { validateAction } from './validate';

describe('validateAction', () => {
  const tmpDir = './tmp-validate-test';
  const validPath = path.join(tmpDir, 'policy.md');

  beforeEach(async () => {
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('valid policy.md passes validation', async () => {
    const content = `
# Architecture Policy
## Layer Rules
## File Conventions
## State & Async Rules
`;
    await fs.writeFile(validPath, content);
    
    const consoleSpy = spyOn(console, 'log').mockImplementation(() => {});
    validateAction(validPath);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('is valid'));
    consoleSpy.mockRestore();
  });

  test('missing file throws "File not found"', () => {
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {}) as any);
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    
    validateAction(path.join(tmpDir, 'non-existent.md'));
    
    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('File not found'));
    expect(exitSpy).toHaveBeenCalledWith(1);
    
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('file missing a required section throws "Missing required sections"', async () => {
    const content = `
# Architecture Policy
## Layer Rules
## File Conventions
`;
    await fs.writeFile(validPath, content);
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {}) as any);
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    validateAction(validPath);

    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('Missing required sections'));
    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('## State & Async Rules'));
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('file missing multiple sections lists all of them in the error', async () => {
    const content = `
# Architecture Policy
`;
    await fs.writeFile(validPath, content);
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {}) as any);
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    validateAction(validPath);

    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('Missing required sections'));
    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('## Layer Rules'));
    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('## File Conventions'));
    expect(errorSpy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('## State & Async Rules'));
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
