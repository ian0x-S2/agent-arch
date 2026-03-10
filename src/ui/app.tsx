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
import { Separator } from './components/Separator';
import { OPTIONS, MAIN_STEPS } from './steps';
import { useWizard } from './hooks/useWizard';

export const App = () => {
  const { exit } = useApp();
  const { step, setStep, selections, updateSelections, nextStep } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const stepIndex = MAIN_STEPS.indexOf(step as any);

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
    <Box flexDirection="column" padding={0}>
      {step === 'welcome' ? (
        <WelcomeScreen onStart={() => nextStep('welcome')} />
      ) : (
        <Box flexDirection="column">
          <Header stepIndex={stepIndex} />
          
          <Box marginTop={0}>
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

            {step === 'component_lib' && (
              <ComponentLibStep
                onSubmit={(val) => {
                  updateSelections({ component_lib: val });
                  nextStep('component_lib');
                }}
              />
            )}

            {step === 'confirm' && (
              <ConfirmScreen
                selections={selections}
                onConfirm={handleConfirm}
                onBack={() => setStep(selections.pattern === 'ui-lib' ? 'component_preference' : 'naming')}
              />
            )}

            {step === 'generating' && (
              <Box flexDirection="column" paddingX={1} paddingY={1}>
                <Text color="yellow">⟳ generating policy artifacts...</Text>
              </Box>
            )}

            {step === 'done' && (
              <Box flexDirection="column">
                <Box paddingX={1} marginBottom={1}>
                  <Text color="green">✓ architecture policy generated</Text>
                </Box>

                <Box paddingX={1} marginBottom={1}>
                  <Text>saved to </Text>
                  <Text color="cyan">.ai/policy.md</Text>
                </Box>

                <Separator />
                
                <Box flexDirection="column" paddingX={1} marginY={0}>
                  <Text dimColor>1. add .ai/policy.md to your ai coding agent context</Text>
                  <Text dimColor>2. run agent-arch validate to check compliance</Text>
                </Box>

                <Separator />

                <Box paddingX={1}>
                  <Text dimColor>enter close · q quit</Text>
                </Box>
              </Box>
            )}

            {error && (
              <Box paddingX={1} marginTop={1}>
                <Text color="red" bold>✖ error: </Text>
                <Text color="red">{error}</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
