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

                    naming_strategy: 'kebab-case',
                    styling_strategy: 'utility-first',
                },
                assertions: [
                    (c) => expect(c).toContain('# Architecture Policy'),
                    (c) => expect(c).toContain('Pattern: feature-sliced'),
                    (c) => expect(c).toContain('Styling: utility-first'),
                    (c) => expect(c).toContain('*.svelte'),
                    (c) => expect(c).toContain('*.svelte.ts'),
                    (c) => expect(c).toContain('feature-scoped'),
                ],
            },
            {
                label: 'Flat + camelCase',
                input: {
                    pattern: 'flat',

                    naming_strategy: 'camelCase',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **flat**'),
                    (c) => expect(c).toContain('flexible'),
                    (c) => expect(c).toContain('*.svelte'),
                    (c) => expect(c).toContain('Barrel exports:** optional'),
                ],
            },
            {
                label: 'Atomic + scoped + snake_case',
                input: {
                    pattern: 'atomic',

                    naming_strategy: 'snake_case',
                    styling_strategy: 'scoped',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **atomic**'),
                    (c) => expect(c).toContain('minimal'),
                    (c) => expect(c).toContain('.module.css'),
                    (c) => expect(c).toContain('*.svelte'),
                ],
            },
            {
                label: 'FSD + load-functions',
                input: {
                    pattern: 'feature-sliced',

                    data_fetching: 'load-functions',
                },
                assertions: [
                    (c) => expect(c).toContain('routes/          # load functions, actions — no domain logic'),
                    (c) => expect(c).not.toContain('remote functions'),
                    (c) => expect(c).toContain('route (load fn)'),
                ],
            },
            {
                label: 'Modular + remote-functions',
                input: {
                    pattern: 'modular',

                    data_fetching: 'remote-functions',
                },
                assertions: [
                    (c) => expect(c).toContain('component | hook → modules/server (*.remote.ts) → UI'),
                    (c) => expect(c).toContain('Remote functions are the only entry point to server-side logic'),
                    (c) => expect(c).toContain('module-scoped'),
                ],
            },
            {
                label: 'Flat + remote-functions',
                input: {
                    pattern: 'flat',

                    data_fetching: 'remote-functions',
                },
                assertions: [
                    (c) => expect(c).toContain('via remote functions; services consumed directly in components'),
                    (c) => expect(c).toContain('# external I/O — RPC endpoints, components may import'),
                ],
            },
            {
                label: 'UI-Lib + utility-first: naming override and tokens removal',
                input: {
                    pattern: 'ui-lib',

                    naming_strategy: 'kebab-case', // Should be overridden to PascalCase
                    styling_strategy: 'utility-first',
                },
                assertions: [
                    (c) => expect(c).toContain('Pattern: **ui-lib**'),
                    (c) => expect(c).toContain('Styling: **utility-first**'),
                    (c) => expect(c).toContain('Component files:** `PascalCase`'),
                    (c) => expect(c).not.toContain('tokens/'),
                    (c) => expect(c).not.toContain('*.tokens.ts'),
                    (c) => expect(c).not.toContain('| tokens |'),
                    (c) => expect(c).not.toContain('styles-hardcoded-without-token'),
                    (c) => expect(c).toContain('arbitrary-values-in-utils'),
                    (c) => expect(c).toContain('## State & Async Rules'),
                    (c) => expect(c).toContain('UI-only state'),
                    (c) => expect(c).toContain('`$state` rune'),
                    (c) => expect(c).toContain('Svelte stores at module level'),
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
