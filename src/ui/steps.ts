import type { OptionWithMeta, Step } from '../types';

export const OPTIONS: Record<string, OptionWithMeta[]> = {
  welcome: [
    {
      label: '🚀 Start Setup',
      value: 'guided',
      description: 'Step-by-step configuration of architectural rules.',
      hint: 'Pattern → Styling → Data Flow → Naming',
    },
  ],
  pattern: [
    {
      label: '🏗️  Feature-Sliced (FSD)',
      value: 'feature-sliced',
      description: 'Scalable enterprise pattern organized by business domains.',
      hint: 'Best for: Large-scale apps with complex domains.',
      impact: '⚡ Enforces strict unidirectional layers (app → features → entities → shared).',
    },
    {
      label: '📦 Modular Layered',
      value: 'modular',
      description: 'Classic technical layering (components, hooks, services).',
      hint: 'Best for: Standard team projects needing clear boundaries.',
      impact: '⚡ Enforces technical isolation between modules.',
    },
    {
      label: '📄 Flat Layered',
      value: 'flat',
      description: 'Direct and minimal hierarchy for rapid development.',
      hint: 'Best for: MVPs, prototypes, or single-developer projects.',
      impact: '⚡ Minimizes structural overhead; focused on co-location.',
    },
    {
      label: '⚛️  Atomic Design',
      value: 'atomic',
      description: 'Organizes UI components by complexity and hierarchy.',
      hint: 'Best for: Design systems and UI-heavy component libraries.',
      impact: '⚡ Enforces rigid composition (Atoms → Molecules → Organisms).',
    },
    {
      label: '🧩 UI Library (Composable)',
      value: 'ui-lib',
      description: 'Strict patterns for high-quality, publishable UI packages.',
      hint: 'Best for: Shared component libraries and design tokens.',
      impact: '⚡ Enforces tokens, compound components, and clean npm contracts.',
    },
  ],
  styling: [
    {
      label: '🎨 Utility-First (Tailwind)',
      value: 'utility-first',
      description: 'Atomic CSS classes defined directly in markup.',
      hint: 'Extreme development speed with minimal bundle size.',
      impact: '⚡ Agent will use Tailwind classes; no external style files.',
    },
    {
      label: '🧩 Scoped CSS (Modules)',
      value: 'scoped',
      description: 'Local styles with component-level encapsulation.',
      hint: 'High isolation; standard for robust component libraries.',
      impact: '⚡ Agent will create companion .module.css files.',
    },
  ],
  component_preference: [
    {
      label: '⚖️  Balanced',
      value: 'balanced',
      description: 'Standard 7-prop limit for a healthy balance.',
      hint: 'Recommended for most generic applications.',
    },
    {
      label: '🛡️  Strict',
      value: 'strict',
      description: 'Aggressive 5-prop limit to force component splitting.',
      hint: 'Ensures extreme reuse and small component units.',
    },
    {
      label: '🌊 Relaxed',
      value: 'relaxed',
      description: 'Higher 10-prop limit for larger, feature-rich components.',
      hint: 'Less overhead for simple data-passing UIs.',
    },
  ],
  component_preference_ui_lib: [
    {
      label: '🏗️  Compound-first (max 5)',
      value: 'strict',
      description: 'Variations become subcomponents (Button.Root, Button.Icon).',
      hint: 'Highly composable API; higher initial implementation cost.',
      impact: '⚡ Agent splits every visual variation into named compound parts.',
    },
    {
      label: '⚖️  Hybrid (max 10)',
      value: 'balanced',
      description: 'Common variants as props, structural parts as compound components.',
      hint: 'Industry standard for modern UI libraries (e.g., Radix).',
      impact: '⚡ Agent uses props for size/color, compound for structure.',
    },
    {
      label: '🌊 Config-driven (max 15)',
      value: 'relaxed',
      description: 'Broad direct prop API; compound only for layout.',
      hint: 'Easiest to consume; harder to extend without breaking changes.',
      impact: '⚡ Agent prefers props over compound parts for most logic.',
    },
  ],
  naming: [
    {
      label: '🔗 kebab-case',
      value: 'kebab-case',
      description: 'user-profile-card.svelte',
      hint: 'Web standard for filenames.',
    },
    {
      label: '🐪 camelCase',
      value: 'camelCase',
      description: 'userProfileCard.svelte',
      hint: 'Standard for many JS/TS environments.',
    },
    {
      label: '🏛️  PascalCase',
      value: 'PascalCase',
      description: 'UserProfileCard.svelte',
      hint: 'Svelte/React component naming standard.',
    },
    {
      label: '🐍 snake_case',
      value: 'snake_case',
      description: 'user_profile_card.svelte',
      hint: 'Common in fullstack or Python-adjacent projects.',
    },
  ],
  data_fetching: [
    {
      label: '🚢 Load Functions',
      value: 'load-functions',
      description: 'Fetch data on the server via +page.server.ts.',
      hint: 'Stable SvelteKit pattern. Data flows top-down through pages.',
    },
    {
      label: '📡 Remote Functions',
      value: 'remote-functions',
      description: 'Call server-side functions directly from components.',
      hint: 'Type-safe. Runs on the server. No API routes needed.',
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
