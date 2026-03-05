import React from 'react';
import { Box, Text } from 'ink';

const STEP_LABELS: Record<string, string> = {
  welcome: 'Start',
  pattern: 'Pattern',
  framework: 'Framework',
  styling: 'Styling',
  naming: 'Naming',
  confirm: 'Confirm',
  generating: 'Generating',
  done: 'Done',
};

const GUIDED_STEPS: string[] = ['pattern', 'framework', 'styling', 'naming', 'confirm'];

export const Header = ({ step, stepIndex, totalSteps }: { step: string; stepIndex: number; totalSteps: number }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box borderStyle="double" borderColor="cyan" paddingX={2} paddingY={0}>
      <Text color="cyan" bold>AGENT-ARCH </Text>
      <Text dimColor>| AI Agent Architecture Policy</Text>
    </Box>
    {totalSteps > 1 && (
      <Box marginTop={1} paddingX={1}>
        {GUIDED_STEPS.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = stepIndex !== -1 && i < stepIndex;
          return (
            <Text key={s}>
              <Text color={isDone ? 'green' : isActive ? 'cyan' : 'gray'} bold={isActive}>
                {isDone ? '✓' : isActive ? '▶' : '○'} {STEP_LABELS[s]}
              </Text>
              {i < GUIDED_STEPS.length - 1 && <Text dimColor>  ──  </Text>}
            </Text>
          );
        })}
      </Box>
    )}
  </Box>
);
