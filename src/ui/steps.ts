import type { OptionWithMeta, Step } from '../types';

export const OPTIONS: Record<string, OptionWithMeta[]> = {
  welcome: [
    {
      label: '🚀 start setup',
      value: 'guided',
      description: 'step-by-step configuration of architectural rules.',
      hint: 'pattern → styling → data flow → naming',
    },
  ],
  pattern: [
    {
      label: '🏗️  Feature-Sliced',
      value: 'feature-sliced',
      description: 'scalable enterprise pattern organized by business domains.',
      hint: 'best for large-scale apps with complex domains.',
    },
    {
      label: '📦 Modular Layered',
      value: 'modular',
      description: 'classic technical layering (components, hooks, services).',
      hint: 'best for standard team projects needing clear boundaries.',
    },
    {
      label: '📄 Flat Layered',
      value: 'flat',
      description: 'direct and minimal hierarchy for rapid development.',
      hint: 'best for mvps, prototypes, or single-developer projects.',
    },
    {
      label: '⚛️  Atomic Design',
      value: 'atomic',
      description: 'organizes ui components by complexity and hierarchy.',
      hint: 'best for design systems and ui-heavy component libraries.',
    },
    {
      label: '🧩 UI Library',
      value: 'ui-lib',
      description: 'strict patterns for high-quality, publishable ui packages.',
      hint: 'best for shared component libraries and design tokens.',
    },
  ],
  styling: [
    {
      label: '🎨 Utility-First',
      value: 'utility-first',
      description: 'atomic css classes defined directly in markup.',
      hint: 'extreme development speed with minimal bundle size.',
    },
    {
      label: '🧩 Scoped CSS',
      value: 'scoped',
      description: 'local styles with component-level encapsulation.',
      hint: 'high isolation; standard for robust component libraries.',
    },
  ],
  component_preference: [
    {
      label: '⚖️  Balanced',
      value: 'balanced',
      description: 'standard 7-prop limit for a healthy balance.',
      hint: 'recommended for most generic applications.',
    },
    {
      label: '🛡️  Strict',
      value: 'strict',
      description: 'aggressive 5-prop limit to force component splitting.',
      hint: 'ensures extreme reuse and small component units.',
    },
    {
      label: '🌊 Relaxed',
      value: 'relaxed',
      description: 'higher 10-prop limit for larger, feature-rich components.',
      hint: 'less overhead for simple data-passing uis.',
    },
  ],
  component_preference_ui_lib: [
    {
      label: '🏗️  Compound-first',
      value: 'strict',
      description: 'variations become subcomponents (button.root, button.icon).',
      hint: 'highly composable api; higher initial implementation cost.',
    },
    {
      label: '⚖️  Hybrid',
      value: 'balanced',
      description: 'common variants as props, structural parts as compound components.',
      hint: 'industry standard for modern ui libraries.',
    },
    {
      label: '🌊 Config-driven',
      value: 'relaxed',
      description: 'broad direct prop api; compound only for layout.',
      hint: 'easiest to consume; harder to extend without breaking changes.',
    },
  ],
  naming: [
    {
      label: '🔗 kebab-case',
      value: 'kebab-case',
      description: 'user-profile-card.svelte',
      hint: 'web standard for filenames.',
    },
    {
      label: '🐪 camelCase',
      value: 'camelCase',
      description: 'userProfileCard.svelte',
      hint: 'standard for many js/ts environments.',
    },
    {
      label: '🏛️  PascalCase',
      value: 'PascalCase',
      description: 'UserProfileCard.svelte',
      hint: 'svelte/react component naming standard.',
    },
    {
      label: '🐍 snake_case',
      value: 'snake_case',
      description: 'user_profile_card.svelte',
      hint: 'common in fullstack or python-adjacent projects.',
    },
  ],
  data_fetching: [
    {
      label: '🚢 Load Functions',
      value: 'load-functions',
      description: 'fetch data on the server via +page.server.ts.',
      hint: 'stable sveltekit pattern. data flows top-down through pages.',
    },
    {
      label: '📡 Remote Functions',
      value: 'remote-functions',
      description: 'call server-side functions directly from components.',
      hint: 'type-safe. runs on the server. no api routes needed.',
    },
  ],
};

export const MAIN_STEPS: Step[] = ['pattern', 'component_lib', 'styling', 'data_fetching', 'component_preference', 'naming', 'confirm'];

export const STEP_LABELS: Partial<Record<Step, string>> = {
  welcome: 'Start',
  pattern: 'Pattern',
  component_lib: 'Library',
  styling: 'Styling',
  data_fetching: 'Fetching',
  component_preference: 'Preference',
  naming: 'Naming',
  confirm: 'Confirm',
  generating: 'Generating',
  done: 'Done',
};
