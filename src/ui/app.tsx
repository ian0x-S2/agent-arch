import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { composePolicy } from '../core/composer';
import type { UserSelections, Step } from '../types';
import { writePolicyFiles } from '../core/writer';
import { Header } from './components/Header';
import { QuestionStep } from './components/QuestionStep';
import { ConfirmScreen } from './components/ConfirmScreen';
import { ComponentLibStep } from './components/ComponentLibStep';
import { OPTIONS, MAIN_STEPS } from './steps';
import { useWizard } from './hooks/useWizard';

export const App = () => {
  const { exit } = useApp();
  const { step, setStep, selections, updateSelections, nextStep } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const stepIndex = MAIN_STEPS.indexOf(step as any);
  const totalSteps = MAIN_STEPS.length;

  const handleSelect = (stepKey: Step, value: string) => {
    let mapping: Partial<UserSelections> = {};
    if (stepKey === 'styling') mapping = { styling_strategy: value as any };
    else if (stepKey === 'naming') mapping = { naming_strategy: value as any };
    else if (stepKey === 'framework') mapping = { framework: value as any };
    else if (stepKey === 'component_preference') mapping = { component_preference: value as any };
    else mapping = { [stepKey]: value } as any;

    updateSelections(mapping);
    nextStep(stepKey, value);
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
            onSelect={() => nextStep('welcome')} 
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
              updateSelections({ component_lib: val });
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

