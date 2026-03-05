import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { generateAction } from '../../src/commands/generate';

const OUTPUT_DIR = './test-output-e2e';

describe('E2E: generate command', () => {
    beforeEach(() => fs.ensureDir(OUTPUT_DIR));
    afterEach(() => fs.remove(OUTPUT_DIR));

    const cases: Array<{
        label: string;
        input: Parameters<typeof generateAction>[0];
        assertions: Array<(content: string) => void>;
    }> = [
            {
                label: 'FSD + utility-first + kebab-case',
                input: {
                    pattern: 'feature-sliced',
                    output_mode: 'compact',
                    naming_strategy: 'kebab-case',
                    styling_strategy: 'utility-first',
                },
                assertions: [
                    (c) => expect(c).toContain('# Architecture Policy'),
                    (c) => expect(c).toContain('Pattern: **feature-sliced**'),
                    (c) => expect(c).toContain('Styling: **utility-first**'),
                    (c) => expect(c).not.toContain('.module.css'),
                    (c) => expect(c).toContain('*.component.tsx'),
                    (c) => expect(c).toContain('feature-based'),
                ],
            },
            {
                label: 'Modular + scoped + PascalCase + React',
                input: {
                    pattern: 'modular',
                    output_mode: 'compact',
                    naming_strategy: 'PascalCase',
                    styling_strategy: 'scoped',
                    framework: 'react',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **modular**'),
                    (c) => expect(c).toContain('.module.css'),
                    (c) => expect(c).toContain('*Component.tsx'),
                    (c) => expect(c).toContain('module-based'),
                    (c) => expect(c).toContain('## Stack'),
                    (c) => expect(c).toContain('Framework:** react'),
                ],
            },
            {
                label: 'Flat + camelCase',
                input: {
                    pattern: 'flat',
                    output_mode: 'compact',
                    naming_strategy: 'camelCase',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **flat**'),
                    (c) => expect(c).toContain('flexible'),
                    (c) => expect(c).toContain('Barrel exports:** optional'),
                ],
            },
            {
                label: 'Atomic + scoped + snake_case',
                input: {
                    pattern: 'atomic',
                    output_mode: 'compact',
                    naming_strategy: 'snake_case',
                    styling_strategy: 'scoped',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **atomic**'),
                    (c) => expect(c).toContain('minimal'),
                    (c) => expect(c).toContain('.module.css'),
                    (c) => expect(c).toContain('*_component.tsx'),
                ],
            },
            {
                label: 'FSD + Vue',
                input: {
                    pattern: 'feature-sliced',
                    output_mode: 'compact',
                    naming_strategy: 'kebab-case',
                    framework: 'vue',
                },
                assertions: [
                    (c) => expect(c).toContain('*.vue'),
                    (c) => expect(c).toContain('Framework:** vue'),
                    (c) => expect(c).toContain('async-await'),
                ],
            },
            {
                label: 'FSD + Svelte',
                input: {
                    pattern: 'feature-sliced',
                    output_mode: 'compact',
                    naming_strategy: 'kebab-case',
                    framework: 'svelte',
                },
                assertions: [
                    (c) => expect(c).toContain('*.svelte'),
                    (c) => expect(c).toContain('*.svelte.ts'),
                    (c) => expect(c).not.toContain('*.test.tsx'),
                    (c) => expect(c).toContain('runes/logic functions'),
                ],
            },
        ];

    for (const { label, input, assertions } of cases) {
        test(label, async () => {
            await generateAction(input, OUTPUT_DIR);
            const content = await fs.readFile(path.join(OUTPUT_DIR, 'policy.md'), 'utf8');
            for (const assert of assertions) {
                assert(content);
            }
        });
    }
});
