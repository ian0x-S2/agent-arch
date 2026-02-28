import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { composePolicy } from '../core/composer';
import type { UserSelections } from '../core/composer';
import { writePolicyFiles } from '../core/writer';
import { TemplateRegistry } from '../core/registry';
import { renderMarkdown } from '../core/renderer/markdown-renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | 'welcome'
  | 'pattern'
  | 'state'
  | 'styling'
  | 'naming'
  | 'enforcement'
  | 'mode'
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
      label: 'Express Setup  ✦ fastest',
      value: 'express',
      description: 'Use recommended defaults. Get up and running in 5 seconds.',
      hint: 'Pattern: FSD | State: Hybrid | Styling: Utility | Naming: kebab',
    },
    {
      label: 'Guided Setup',
      value: 'guided',
      description: 'Step-by-step configuration of all architectural rules.',
      hint: 'Best for specialized projects or strict team requirements.',
    },
  ],
  pattern: [
    {
      label: 'Feature-Sliced (FSD)  ✦ recommended',
      value: 'feature-sliced',
      description: 'Organizes code by business domain (e.g., /auth, /billing).',
      hint: 'Scaling: High | Complexity: High | Use for medium-to-large apps.',
      impact: '⚡ Prompt: Adds strict layer hierarchy and import rules (ui→hooks→state).',
    },
    {
      label: 'Modular Layered',
      value: 'modular',
      description: 'Organizes by technical layers (components/, hooks/, services/).',
      hint: 'Scaling: Medium | Complexity: Low | Standard for many teams.',
      impact: '⚡ Prompt: Defines clear technical boundaries between layers.',
    },
    {
      label: 'Flat Layered',
      value: 'flat',
      description: 'Simple, flat structure with minimal hierarchy.',
      hint: 'Scaling: Low | Complexity: Very Low | Best for MVPs.',
      impact: '⚡ Prompt: Minimizes structural noise, focused on simple exports.',
    },
  ],
  state: [
    {
      label: 'Hybrid  ✦ recommended',
      value: 'hybrid',
      description: 'Local UI state combined with feature-specific shared stores.',
      hint: 'Flexible: High | Performance: High.',
      impact: '⚡ Prompt: Agent uses stores for shared data, local state for UI.',
    },
    {
      label: 'Centralized',
      value: 'centralized',
      description: 'A single, global source of truth (e.g., Redux, global Store).',
      hint: 'Consistency: High | Overhead: Medium.',
      impact: '⚡ Prompt: Agent is instructed to pipe all data through the global store.',
    },
    {
      label: 'Distributed',
      value: 'distributed',
      description: 'Strictly component-local state and props. No global store.',
      hint: 'Simplicity: High | Sync: Low.',
      impact: '⚡ Prompt: Agent avoids stores, focuses on prop-drilling/context.',
    },
  ],
  styling: [
    {
      label: 'Utility-First (Tailwind)  ✦ recommended',
      value: 'utility-first',
      description: 'Atomic classes directly in markup.',
      hint: 'Speed: Extreme | Bundle Size: Minimal.',
      impact: '⚡ Prompt: Agent writes CSS directly in JSX attributes.',
    },
    {
      label: 'Scoped / Modular (CSS Modules)',
      value: 'scoped',
      description: 'Component-specific styles with local scope.',
      hint: 'Encapsulation: High | Reuse: Medium.',
      impact: '⚡ Prompt: Agent creates companion .module.css files.',
    },
    {
      label: 'CSS-in-JS (Emotion/Styled)',
      value: 'css-in-js',
      description: 'Styles defined within the TypeScript code.',
      hint: 'Dynamic: High | Portability: Low.',
      impact: '⚡ Prompt: Agent defines styled components in the same file.',
    },
  ],
  naming: [
    {
      label: 'kebab-case',
      value: 'kebab-case',
      description: 'Lowercase words separated by hyphens (e.g., user-modal.ts).',
      hint: 'Web standard for filenames.',
    },
    {
      label: 'PascalCase',
      value: 'PascalCase',
      description: 'All words capitalized (e.g., UserModal.tsx).',
      hint: 'Standard for React/Vue component names.',
    },
    {
      label: 'snake_case',
      value: 'snake_case',
      description: 'Words separated by underscores (e.g., user_modal.ts).',
      hint: 'Common in some backend-heavy frontend projects.',
    },
  ],
  enforcement: [
    {
      label: 'Strict',
      value: 'strict',
      description: 'Every rule must be followed. Violations block the agent.',
      hint: 'No compromise on architectural integrity.',
      impact: '⚡ Prompt: Adds "CRITICAL: VIOLATIONS FORBIDDEN" header.',
    },
    {
      label: 'Moderate  ✦ recommended',
      value: 'moderate',
      description: 'Violations trigger warnings but the agent can proceed.',
      hint: 'Governance with a safety valve.',
    },
    {
      label: 'Relaxed',
      value: 'relaxed',
      description: 'Advisory only. The agent may deviate with justification.',
      hint: 'Best for exploration.',
    },
  ],
  mode: [
    {
      label: 'Balanced  ✦ recommended',
      value: 'balanced',
      description: 'Clear structure with concise descriptions (~600 tokens).',
      hint: 'Sweet spot for GPT-4 / Claude 3.5 Sonnet.',
    },
    {
      label: 'Compact',
      value: 'compact',
      description: 'Declarative constraints only. No explanations (~390 tokens).',
      hint: 'Best for small context windows or expert agents.',
      impact: '⚡ Prompt: Reduces token usage by ~40%.',
    },
    {
      label: 'Verbose',
      value: 'verbose',
      description: 'Full definitions with rationale and examples (~900 tokens).',
      hint: 'Best for training or less capable models.',
    },
  ],
};

const STEP_LABELS: Record<Step, string> = {
  welcome: 'Start',
  pattern: 'Pattern',
  state: 'State',
  styling: 'Styling',
  naming: 'Naming',
  enforcement: 'Enforcement',
  mode: 'Mode',
  confirm: 'Confirm',
  generating: 'Generating...',
  done: 'Done',
};

const GUIDED_STEPS: Step[] = ['pattern', 'state', 'styling', 'naming', 'enforcement', 'mode', 'confirm'];

// ─── Sub-components ────────────────────────────────────────────────────────────

const Header = ({ stepIndex, totalSteps }: { stepIndex: number; totalSteps: number }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box>
      <Text color="cyan" bold>AGENT-ARCH </Text>
      <Text dimColor>— AI Agent Architecture Policy Generator</Text>
    </Box>
    {totalSteps > 1 && (
      <Box marginTop={1}>
        {GUIDED_STEPS.map((s, i) => (
          <Text key={s}>
            <Text color={i < stepIndex ? 'green' : i === stepIndex ? 'cyan' : 'gray'}>
              {i < stepIndex ? '●' : i === stepIndex ? '◉' : '○'}
            </Text>
            <Text color={i === stepIndex ? 'cyan' : 'gray'}> {STEP_LABELS[s]}</Text>
            {i < GUIDED_STEPS.length - 1 && <Text dimColor> › </Text>}
          </Text>
        ))}
      </Box>
    )}
  </Box>
);

const OptionDescription = ({ option }: { option: OptionWithMeta | undefined }) => {
  if (!option) return null;
  return (
    <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
      <Text color="white">{option.description}</Text>
      <Box marginTop={1}>
        <Text dimColor italic>💡 {option.hint}</Text>
      </Box>
      {option.impact && (
        <Box marginTop={1}>
          <Text color="yellow">{option.impact}</Text>
        </Box>
      )}
    </Box>
  );
};

const QuestionStep = ({
  stepKey,
  onSelect,
}: {
  stepKey: string;
  onSelect: (value: string) => void;
}) => {
  const options = OPTIONS[stepKey] ?? [];
  const [focused, setFocused] = useState(options[0]?.value ?? '');

  const inkItems = options.map((o) => ({ label: o.label, value: o.value }));
  const focusedOption = options.find((o) => o.value === focused);

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        {stepKey === 'welcome' ? 'How do you want to start?' : `Select ${STEP_LABELS[stepKey as Step]}`}
      </Text>
      <Text dimColor>Use ↑↓ to navigate, Enter to select</Text>
      <Box marginTop={1}>
        <SelectInput
          items={inkItems}
          onSelect={(item) => onSelect(item.value)}
          onHighlight={(item) => setFocused(item.value)}
        />
      </Box>
      <OptionDescription option={focusedOption} />
    </Box>
  );
};

const ConfirmScreen = ({
  selections,
  onConfirm,
  onBack,
}: {
  selections: Partial<UserSelections>;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  useInput((input, key) => {
    if (key.return) onConfirm();
    if (key.escape || input === 'b') onBack();
  });

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">Review & Confirm</Text>
      <Text dimColor>Verify your choices before generating the policy.</Text>

      <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Text bold color="cyan">Selected Configuration</Text>
        <Box marginTop={1} flexDirection="column">
          {(['pattern', 'state_philosophy', 'styling_strategy', 'naming_strategy', 'enforcement', 'output_mode'] as const).map((key) => {
             const labelMap: Record<string, string> = {
               pattern: 'Pattern',
               state_philosophy: 'State',
               styling_strategy: 'Styling',
               naming_strategy: 'Naming',
               enforcement: 'Enforcement',
               output_mode: 'Mode'
             };
             return (
              <Box key={key}>
                <Box width={22}>
                  <Text dimColor>{labelMap[key]}:</Text>
                </Box>
                <Text color="green" bold>{(selections as any)[key]}</Text>
              </Box>
             );
          })}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="green" bold>↵ Enter </Text>
        <Text>to generate  </Text>
        <Text color="yellow" bold>Esc / b </Text>
        <Text>to go back</Text>
      </Box>
    </Box>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────────────

const RECOMMENDED_DEFAULTS: UserSelections = {
  pattern: 'feature-sliced',
  state_philosophy: 'hybrid',
  styling_strategy: 'utility-first',
  naming_strategy: 'kebab-case',
  enforcement: 'moderate',
  output_mode: 'balanced',
};

export const App = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [selections, setSelections] = useState<Partial<UserSelections>>({});
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const stepIndex = GUIDED_STEPS.indexOf(step);

  const handleWelcomeSelect = (value: string) => {
    if (value === 'express') {
      setSelections(RECOMMENDED_DEFAULTS);
      setStep('confirm');
    } else {
      setStep('pattern');
    }
  };

  const handleSelect = (stepKey: Step, value: string) => {
    let mapping: Partial<UserSelections> = {};
    if (stepKey === 'state') mapping = { state_philosophy: value };
    else if (stepKey === 'styling') mapping = { styling_strategy: value };
    else if (stepKey === 'naming') mapping = { naming_strategy: value as UserSelections['naming_strategy'] };
    else if (stepKey === 'mode') mapping = { output_mode: value as any };
    else mapping = { [stepKey]: value } as any;

    const next: Partial<UserSelections> = { ...selections, ...mapping };
    setSelections(next);

    const idx = GUIDED_STEPS.indexOf(stepKey);
    const nextStep = GUIDED_STEPS[idx + 1];
    if (nextStep) setStep(nextStep);
  };

  const handleConfirm = async () => {
    setStep('generating');
    try {
      const policy = composePolicy(selections as UserSelections);
      await writePolicyFiles(policy);
      
      // Generate preview
      const prompt = renderMarkdown(policy);
      setGeneratedPrompt(prompt);
      
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useInput((input, key) => {
    if (step === 'done') {
      if (input === 'q' || key.escape || key.return) exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header stepIndex={stepIndex} totalSteps={step === 'welcome' ? 1 : GUIDED_STEPS.length} />

      <Box marginTop={1}>
        {/* Welcome */}
        {step === 'welcome' && <QuestionStep stepKey="welcome" onSelect={handleWelcomeSelect} />}

        {/* Wizard steps */}
        {(['pattern', 'state', 'styling', 'naming', 'enforcement', 'mode'] as const).map(
          (s) =>
            step === s && (
              <QuestionStep key={s} stepKey={s} onSelect={(val) => handleSelect(s, val)} />
            ),
        )}

        {/* Confirm */}
        {step === 'confirm' && (
          <ConfirmScreen
            selections={selections}
            onConfirm={handleConfirm}
            onBack={() => setStep(selections === RECOMMENDED_DEFAULTS ? 'welcome' : 'mode')}
          />
        )}

        {/* Generating */}
        {step === 'generating' && (
          <Box flexDirection="column">
            <Text color="yellow" bold>⟳ Generating policy artifact...</Text>
            <Text dimColor>  Rendering policy.md</Text>
          </Box>
        )}

        {/* Done */}
        {step === 'done' && (
          <Box flexDirection="column">
            <Box borderStyle="round" borderColor="green" paddingX={2} paddingY={1} flexDirection="column">
              <Text color="green" bold>✓ Architecture policy generated successfully!</Text>
              <Box marginTop={1} flexDirection="column">
                <Text dimColor>Artifacts created in .ai/ folder.</Text>
              </Box>
            </Box>

            <Box marginTop={1} flexDirection="column">
              <Text bold color="cyan">Preview: .ai/policy.md</Text>
              <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
                {/* Use the markdown preview instead */}
                <Text>{generatedPrompt.split('\n').slice(0, 15).join('\n')}</Text>
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
          <Box borderStyle="single" borderColor="red" paddingX={1} marginTop={1}>
            <Text color="red">✗ Error: {error}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
