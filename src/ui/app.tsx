import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { composePolicy } from '../core/composer';
import type { UserSelections } from '../core/composer';
import { writePolicyFiles } from '../core/writer';
import { Header } from './components/Header';
import { QuestionStep } from './components/QuestionStep';
import { ConfirmScreen } from './components/ConfirmScreen';
import { ComponentLibStep } from './components/ComponentLibStep';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | 'welcome'
  | 'pattern'
  | 'framework'
  | 'component_lib'
  | 'styling'
  | 'component_preference'
  | 'naming'
  | 'confirm'
  | 'generating'
  | 'done';

interface OptionWithMeta {
  label: string;
  value: string;
  description: string;
  hint: string;
  impact?: string;
}

// ─── Option Definitions ───────────────────────────────────────────────────────

const OPTIONS: Record<string, OptionWithMeta[]> = {
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

const GUIDED_STEPS: Step[] = ['pattern', 'framework', 'component_lib', 'styling', 'component_preference', 'naming', 'confirm'];
const MAIN_STEPS: Step[] = ['pattern', 'framework', 'styling', 'naming', 'confirm'];

// ─── Main App ──────────────────────────────────────────────────────────────────

export const App = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [selections, setSelections] = useState<Partial<UserSelections>>({});
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const stepIndex = MAIN_STEPS.indexOf(step);
  const totalSteps = MAIN_STEPS.length;

  const handleWelcomeSelect = () => {
    setStep('pattern');
  };

  const handleSelect = (stepKey: Step, value: string) => {
    let mapping: Partial<UserSelections> = {};
    if (stepKey === 'styling') mapping = { styling_strategy: value };
    else if (stepKey === 'naming') mapping = { naming_strategy: value as UserSelections['naming_strategy'] };
    else if (stepKey === 'framework') mapping = { framework: value as UserSelections['framework'] };
    else if (stepKey === 'component_preference') mapping = { component_preference: value as UserSelections['component_preference'] };
    else mapping = { [stepKey]: value } as any;

    const next: Partial<UserSelections> = { ...selections, ...mapping, output_mode: 'compact' };
    setSelections(next);

    const idx = GUIDED_STEPS.indexOf(stepKey);
    const nextStep = GUIDED_STEPS[idx + 1];
    if (nextStep) setStep(nextStep);
  };

  const handleConfirm = async () => {
    setStep('generating');
    try {
      const policy = composePolicy(selections as UserSelections);
      const { mdContent } = await writePolicyFiles(policy);
      
      setGeneratedPrompt(mdContent);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep('confirm');
    }
  };

  useInput((input, key) => {
    if (step === 'done') {
      if (input === 'q' || key.escape || key.return) exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header step={step} stepIndex={stepIndex} totalSteps={step === 'welcome' ? 1 : totalSteps} />

      <Box marginTop={1}>
        {/* Welcome */}
        {step === 'welcome' && (
          <QuestionStep 
            stepKey="welcome" 
            options={OPTIONS.welcome} 
            onSelect={handleWelcomeSelect} 
          />
        )}

        {/* Wizard steps */}
        {(['pattern', 'framework', 'styling', 'component_preference', 'naming'] as const).map(
          (s) => {
            const options = s === 'styling' 
              ? OPTIONS.styling.filter(o => !(o.value === 'css-in-js' && (selections.framework === 'vue' || selections.framework === 'svelte')))
              : OPTIONS[s];

            return (
              step === s && (
                <QuestionStep 
                  key={s} 
                  stepKey={s} 
                  options={options} 
                  onSelect={(val) => handleSelect(s, val)} 
                />
              )
            );
          },
        )}

        {/* Component Lib Step */}
        {step === 'component_lib' && (
          <ComponentLibStep
            onSubmit={(val) => {
              setSelections(prev => ({ ...prev, component_lib: val, output_mode: 'compact' }));
              setStep('styling');
            }}
          />
        )}

        {/* Confirm */}
        {step === 'confirm' && (
          <ConfirmScreen
            selections={selections}
            onConfirm={handleConfirm}
            onBack={() => setStep('naming')}
          />
        )}

        {/* Generating */}
        {step === 'generating' && (
          <Box flexDirection="column" paddingLeft={1}>
            <Text color="yellow" bold>⟳ Generating policy artifacts...</Text>
            <Box flexDirection="column" marginLeft={2} marginTop={1}>
              <Text color="cyan">▶ Rendering policy.md</Text>
            </Box>
          </Box>
        )}

        {/* Done */}
        {step === 'done' && (
          <Box flexDirection="column" paddingLeft={1}>
            <Box borderStyle="round" borderColor="green" paddingX={2} paddingY={1} flexDirection="column">
              <Text color="green" bold>✓ SUCCESS</Text>
              <Text color="white">Architecture policy generated successfully!</Text>
              <Box marginTop={1}>
                <Text dimColor>Artifact created in </Text>
                <Text color="yellow" bold>.ai/policy.md</Text>
              </Box>
            </Box>

            <Box marginTop={1} flexDirection="column" paddingLeft={1}>
              <Text bold color="cyan">🚀 Next Step:</Text>
              <Text> 1. Attach <Text color="yellow">.ai/policy.md</Text> to your AI Agent.</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
              <Text bold color="cyan" underline>Preview: .ai/policy.md</Text>
              <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
                <Text>
                  {generatedPrompt
                    .split('\n')
                    .slice(0, 15)
                    .map(line => line.replace(/^#+\s/, '➤ ').replace(/\*\*/g, ''))
                    .join('\n')}
                </Text>
                <Text dimColor>... (truncated)</Text>
              </Box>
            </Box>

            <Box marginTop={1}>
              <Text>Press </Text>
              <Text color="yellow" bold>Enter / q</Text>
              <Text> to exit</Text>
            </Box>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box borderStyle="single" borderColor="red" paddingX={2} paddingY={1} marginTop={1}>
            <Text color="red" bold>✖ Error</Text>
            <Text color="red">{error}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
