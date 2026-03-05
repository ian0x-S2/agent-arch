import type { OptionWithMeta, Step } from '../types';

export const OPTIONS: Record<string, OptionWithMeta[]> = {
  welcome: [
    {
      label: '🚀 Start Setup',
      value: 'guided',
      description: 'Step-by-step configuration of architectural rules.',
      hint: 'Pattern | Styling | Naming',
    },
  ],
  pattern: [
    {
      label: '🏗️  Feature-Sliced (FSD)',
      value: 'feature-sliced',
      description: 'Organizes code by business domain (e.g., /auth, /billing).',
      hint: 'Scaling: High | Complexity: High | Use for medium-to-large apps.',
      impact: '⚡ Prompt: Adds strict layer hierarchy and import rules (ui→hooks→state).',
    },
    {
      label: '📦 Modular Layered',
      value: 'modular',
      description: 'Organizes by technical layers (components/, hooks/, services/).',
      hint: 'Scaling: Medium | Complexity: Low | Standard for many teams.',
      impact: '⚡ Prompt: Defines clear technical boundaries between layers.',
    },
    {
      label: '📄 Flat Layered',
      value: 'flat',
      description: 'Simple, flat structure with minimal hierarchy.',
      hint: 'Scaling: Low | Complexity: Very Low | Best for MVPs.',
      impact: '⚡ Prompt: Minimizes structural noise, focused on simple exports.',
    },
    {
      label: '⚛️  Atomic Design',
      value: 'atomic',
      description: 'Organizes UI by complexity (Atoms, Molecules, Organisms).',
      hint: 'Scaling: Medium | Complexity: Medium | Best for design systems.',
      impact: '⚡ Prompt: Enforces strict composition hierarchy (Atoms → Molecules → ...).',
    },
  ],
  framework: [
    {
      label: '⚛️  React',
      value: 'react',
      description: 'Component-based UI library. Hooks for logic, JSX for templates.',
      hint: 'Most common choice. Works with any arch pattern.',
    },
    {
      label: '💚 Vue',
      value: 'vue',
      description: 'Progressive framework. Composables follow the use* convention.',
      hint: 'Good fit for modular and flat patterns.',
    },
    {
      label: '🔥 Svelte',
      value: 'svelte',
      description: 'Compiler-based framework. Reactive stores replace hooks.',
      hint: 'Minimal boilerplate. State rules differ from React/Vue.',
    },
  ],
  styling: [
    {
      label: '🎨 Utility-First (Tailwind)',
      value: 'utility-first',
      description: 'Atomic classes directly in markup.',
      hint: 'Speed: Extreme | Bundle Size: Minimal.',
      impact: '⚡ Prompt: Agent writes CSS directly in JSX attributes.',
    },
    {
      label: '🧩 Scoped / Modular (CSS Modules)',
      value: 'scoped',
      description: 'Component-specific styles with local scope.',
      hint: 'Encapsulation: High | Reuse: Medium.',
      impact: '⚡ Prompt: Agent creates companion .module.css files.',
    },
    {
      label: '💅 CSS-in-JS (Emotion/Styled)',
      value: 'css-in-js',
      description: 'Styles defined within the TypeScript code.',
      hint: 'Dynamic: High | Portability: Low.',
      impact: '⚡ Prompt: Agent defines styled components in the same file.',
    },
  ],
  component_preference: [
    {
      label: '⚖️  Balanced',
      value: 'balanced',
      description: 'Standard props limit (7). Good for most projects.',
      hint: 'Balanced reuse and complexity.',
    },
    {
      label: '🛡️  Strict',
      value: 'strict',
      description: 'Aggressive prop limit (5). Enforces small, focused components.',
      hint: 'High reuse, more small components.',
    },
    {
      label: '🌊 Relaxed',
      value: 'relaxed',
      description: 'Higher prop limit (10). Allows larger components.',
      hint: 'Less overhead, potentially higher complexity.',
    },
  ],
  naming: [
    {
      label: '🔗 kebab-case (user-profile.ts)',
      value: 'kebab-case',
      description: 'Lowercase words separated by hyphens.',
      hint: 'The most common standard for web filenames.',
    },
    {
      label: '🐪 camelCase (userProfile.ts)',
      value: 'camelCase',
      description: 'Lowercase first letter, capitalized subsequent words.',
      hint: 'Standard for many JavaScript/TypeScript projects.',
    },
    {
      label: '🏛️  PascalCase (UserProfile.tsx)',
      value: 'PascalCase',
      description: 'All words capitalized.',
      hint: 'Standard for React/Vue component names.',
    },
    {
      label: '🐍 snake_case (user_profile.ts)',
      value: 'snake_case',
      description: 'Words separated by underscores.',
      hint: 'Common in backend-heavy or Python-influenced projects.',
    },
  ],
};

export const GUIDED_STEPS: Step[] = ['pattern', 'framework', 'component_lib', 'styling', 'component_preference', 'naming', 'confirm'];
export const MAIN_STEPS: Step[] = ['pattern', 'framework', 'styling', 'naming', 'confirm'];
