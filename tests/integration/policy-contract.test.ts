import { describe, test, expect } from 'bun:test';
import { composePolicy } from '../../src/core/composer';
import { renderMarkdown } from '../../src/core/renderer/markdown-renderer';

const PATTERNS = ['feature-sliced', 'modular', 'flat', 'atomic'] as const;
const NAMINGS = ['kebab-case', 'PascalCase', 'camelCase', 'snake_case'] as const;
const STYLINGS = ['utility-first', 'scoped', 'any'] as const;

const INVARIANTS: Array<{ label: string; check: (output: string) => boolean }> = [
    { label: 'tem cabeçalho', check: (c) => c.startsWith('# Architecture Policy') },
    { label: 'tem seção de layers', check: (c) => c.includes('## Layer Rules') || c.includes('## Layers & Import Direction') },
    { label: 'tem seção de file conventions', check: (c) => c.includes('## File Conventions') },
    { label: 'tem seção de state', check: (c) => c.includes('## State & Async Rules') || c.includes('## State & Data Flow') || c.includes('## Data Flow') },
    { label: 'não tem undefined literal', check: (c) => !c.includes('undefined') },
    { label: 'não tem [object Object]', check: (c) => !c.includes('[object Object]') },
    { label: 'sempre mostra svelte no stack', check: (c) => c.includes('svelte') || c.includes('Svelte') },
];

describe('Policy contract: todas as combinações válidas', () => {
    for (const pattern of PATTERNS) {
        for (const naming of NAMINGS) {
            for (const styling of STYLINGS) {
                const label = `${pattern} + ${naming} + ${styling}`;

                test(label, () => {
                    const policy = composePolicy({
                        pattern,

                        naming_strategy: naming,
                        styling_strategy: styling,
                    });

                    const output = renderMarkdown(policy);

                    for (const invariant of INVARIANTS) {
                        expect(
                            invariant.check(output),
                            `Falhou invariante "${invariant.label}" para: ${label}`,
                        ).toBe(true);
                    }
                });
            }
        }
    }
});
