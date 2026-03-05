import { describe, test, expect } from 'bun:test';
import { composePolicy } from '../../src/core/composer';
import { renderMarkdown } from '../../src/core/renderer/markdown-renderer';

describe('Regras de negócio: styling_strategy', () => {
    test('utility-first: sem .module.css ou .css no output', () => {
        const output = renderMarkdown(composePolicy({
            pattern: 'feature-sliced',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
            styling_strategy: 'utility-first',
        }));
        expect(output).not.toContain('.module.css');
        expect(output).not.toContain('.css');
    });

    test('scoped: .module.css aparece nos companions e na estrutura', () => {
        const output = renderMarkdown(composePolicy({
            pattern: 'atomic',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
            styling_strategy: 'scoped',
        }));
        expect(output).toContain('.module.css');
    });

    test('css-in-js: sem companion de estilo, mas style_co_location = true', () => {
        const policy = composePolicy({
            pattern: 'modular',
            output_mode: 'compact',
            naming_strategy: 'PascalCase',
            styling_strategy: 'css-in-js',
        });
        for (const typeDef of Object.values(policy.file_conventions.types)) {
            expect(typeDef.companions?.['style']).toBeUndefined();
        }
        expect(policy.ui_constraints.style_co_location).toBe(true);
    });
});

describe('Regras de negócio: component_preference', () => {
    test('strict: max_props = 5 e aparece no markdown', () => {
        const policy = composePolicy({
            pattern: 'flat',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
            component_preference: 'strict',
        });
        expect(policy.ui_constraints.component_max_props).toBe(5);
        expect(renderMarkdown(policy)).toContain('Max props:** 5');
    });

    test('balanced: max_props = 7', () => {
        const policy = composePolicy({
            pattern: 'flat',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
            component_preference: 'balanced',
        });
        expect(policy.ui_constraints.component_max_props).toBe(7);
    });

    test('relaxed: max_props = 10', () => {
        const policy = composePolicy({
            pattern: 'flat',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
            component_preference: 'relaxed',
        });
        expect(policy.ui_constraints.component_max_props).toBe(10);
    });
});

describe('Regras de negócio: naming_strategy no markdown final', () => {
    const cases = [
        { strategy: 'kebab-case', expected: '*.component.tsx' },
        { strategy: 'PascalCase', expected: '*Component.tsx' },
        { strategy: 'snake_case', expected: '*_component.tsx' },
        { strategy: 'camelCase', expected: '*.component.tsx' },
    ] as const;

    for (const { strategy, expected } of cases) {
        test(`${strategy} → padrão "${expected}" presente no markdown`, () => {
            const output = renderMarkdown(composePolicy({
                pattern: 'feature-sliced',
                output_mode: 'compact',
                naming_strategy: strategy,
            }));
            expect(output).toContain(expected);
        });
    }
});

describe('Regras de negócio: state derivado por pattern', () => {
    const cases = [
        { pattern: 'feature-sliced', expectedScope: 'feature-based' },
        { pattern: 'modular', expectedScope: 'module-based' },
        { pattern: 'flat', expectedScope: 'any' },
        { pattern: 'atomic', expectedScope: 'minimal' },
    ] as const;

    for (const { pattern, expectedScope } of cases) {
        test(`${pattern} → state scope "${expectedScope}" no markdown`, () => {
            const output = renderMarkdown(composePolicy({
                pattern,
                output_mode: 'compact',
                naming_strategy: 'kebab-case',
            }));
            expect(output).toContain(expectedScope);
        });
    }
});

describe('Regras de negócio: flat pattern', () => {
    test('barrel_exports_required = false independente do template default', () => {
        const policy = composePolicy({
            pattern: 'flat',
            output_mode: 'compact',
            naming_strategy: 'kebab-case',
        });
        expect(policy.structural_constraints.barrel_exports_required).toBe(false);
        expect(renderMarkdown(policy)).toContain('Barrel exports:** optional');
    });
});
