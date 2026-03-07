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
    {
      label: '🧩 Composable UI Primitives',
      value: 'ui-lib',
      description: 'Layered structure for publishable component libraries. Tokens → Primitives → Components → Patterns.',
      hint: 'Scaling: Medium | Use for design systems and shared UI packages.',
      impact: '⚡ Prompt: Enforces token usage, compound components, and clean npm export contracts.',
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
  component_preference_ui_lib: [
    {
      label: '🏗️  Compound-first (max 5 props)',
      value: 'strict',
      description: 'Visual variations become compound subcomponents. Button.Root, Button.Icon.',
      hint: 'Most composable API. Higher implementation cost per component.',
      impact: '⚡ Prompt: Agent splits every visual variation into a named compound part.',
    },
    {
      label: '⚖️  Hybrid (max 10 props)',
      value: 'balanced',
      description: 'Common variations as direct props, structural extensions as compound parts.',
      hint: 'Recommended for most UI libraries. Balances ergonomics and composability.',
      impact: '⚡ Prompt: Agent uses props for variant/size, compound for slots and extensions.',
    },
    {
      label: '🌊 Config-driven (max 15 props)',
      value: 'relaxed',
      description: 'Broad direct API. Compound pattern only for structural composition.',
      hint: 'Easiest to consume. Harder to extend without breaking changes.',
      impact: '⚡ Prompt: Agent prefers props over compound parts wherever possible.',
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
      label: '🏛️  PascalCase (UserProfile.ts)',
      value: 'PascalCase',
      description: 'All words capitalized.',
      hint: 'Standard for Svelte component names.',
    },
    {
      label: '🐍 snake_case (user_profile.ts)',
      value: 'snake_case',
      description: 'Words separated by underscores.',
      hint: 'Common in backend-heavy or Python-influenced projects.',
    },
  ],
};

export const MAIN_STEPS: Step[] = ['pattern', 'component_lib', 'styling', 'component_preference', 'naming', 'confirm'];

export const STEP_LABELS: Partial<Record<Step, string>> = {
  welcome: 'Start',
  pattern: 'Pattern',
  component_lib: 'Library',
  styling: 'Styling',
  component_preference: 'Preference',
  naming: 'Naming',
  confirm: 'Confirm',
  generating: 'Generating',
  done: 'Done',
};
