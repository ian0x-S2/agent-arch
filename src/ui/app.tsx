import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { composePolicy } from '../core/composer';
import type { UserSelections, Step } from '../types';
import { writePolicyFiles } from '../core/writer';
import { Header } from './components/Header';
import { QuestionStep } from './components/QuestionStep';
import { ConfirmScreen } from './components/ConfirmScreen';
import { ComponentLibStep } from './components/ComponentLibStep';
import { WelcomeScreen } from './components/WelcomeScreen';
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
    if (stepKey === 'styling') mapping = { styling_strategy: value as UserSelections['styling_strategy'] };
    else if (stepKey === 'naming') mapping = { naming_strategy: value as UserSelections['naming_strategy'] };
    else if (stepKey === 'component_preference') mapping = { component_preference: value as UserSelections['component_preference'] };
    else if (stepKey === 'data_fetching') mapping = { data_fetching: value as UserSelections['data_fetching'] };
    else mapping = { [stepKey]: value };

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
      {step !== 'welcome' && (
        <Header step={step} stepIndex={stepIndex} totalSteps={step === 'welcome' ? 1 : totalSteps} />
      )}

      <Box marginTop={1}>
        {/* Welcome */}
        {step === 'welcome' && (
          <WelcomeScreen onStart={() => nextStep('welcome')} />
        )}

        {/* Wizard steps */}
        {(['pattern', 'styling', 'data_fetching', 'component_preference', 'naming'] as const).map(
          (s) => {
            const options = s === 'component_preference' && selections.pattern === 'ui-lib'
                ? OPTIONS.component_preference_ui_lib ?? []
                : OPTIONS[s] ?? [];
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
              nextStep('component_lib');
            }}
          />
        )}

        {/* Confirm */}
        {step === 'confirm' && (
          <ConfirmScreen
            selections={selections}
            onConfirm={handleConfirm}
            onBack={() => setStep(selections.pattern === 'ui-lib' ? 'component_preference' : 'naming')}
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
            <Box borderStyle="round" borderColor="green" paddingX={2} paddingY={1} flexDirection="column" width={55}>
              <Text color="green" bold>✨ SUCCESS</Text>
              <Box marginTop={1}>
                <Text color="white">Your </Text>
                <Text color="yellow" bold>architecture policy</Text>
                <Text color="white"> is ready.</Text>
              </Box>
              <Box marginTop={1}>
                <Text dimColor>Saved to: </Text>
                <Text color="cyan">.ai/policy.md</Text>
              </Box>
            </Box>

            <Box marginTop={2} flexDirection="column" paddingLeft={1}>
              <Text bold color="cyan">Next Step</Text>
              <Box marginTop={1}>
                <Text color="white">1. </Text>
                <Text dimColor>Add </Text>
                <Text color="yellow">.ai/policy.md</Text>
                <Text dimColor> to your AI coding agent.</Text>
              </Box>
              <Box>
                <Text color="white">2. </Text>
                <Text dimColor>Run </Text>
                <Text color="cyan">agent-arch validate</Text>
                <Text dimColor> to check compliance anytime.</Text>
              </Box>
            </Box>

            <Box marginTop={2} flexDirection="column">
              <Text bold color="gray" italic> Preview </Text>
              <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1} width={60} opacity={0.8}>
                <Text dimColor>
                  {generatedPrompt
                    .split('\n')
                    .slice(0, 10)
                    .map(line => line.replace(/^#+\s/, '➤ ').replace(/\*\*/g, ''))
                    .join('\n')}
                </Text>
                <Text dimColor>  ... (truncated)</Text>
              </Box>
            </Box>

            <Box marginTop={1} paddingLeft={1}>
              <Text dimColor>Press </Text>
              <Text color="yellow" bold>Enter</Text>
              <Text dimColor> or </Text>
              <Text color="yellow" bold>Q</Text>
              <Text dimColor> to close</Text>
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

