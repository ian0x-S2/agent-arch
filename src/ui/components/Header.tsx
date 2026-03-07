import React from 'react';
import { Box, Text } from 'ink';
import { STEP_LABELS, MAIN_STEPS } from '../steps';

export const Header = ({ step, stepIndex, totalSteps }: { step: string; stepIndex: number; totalSteps: number }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box borderStyle="double" borderColor="cyan" paddingX={2} paddingY={0}>
      <Text color="cyan" bold>AGENT-ARCH </Text>
      <Text dimColor>| AI Agent Architecture Policy</Text>
    </Box>
    {totalSteps > 1 && (
      <Box marginTop={1} paddingX={1}>
        {MAIN_STEPS.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = stepIndex !== -1 && i < stepIndex;
          const label = STEP_LABELS[s] || s;
          return (
            <Text key={s}>
              <Text color={isDone ? 'green' : isActive ? 'cyan' : 'gray'} bold={isActive}>
                {isDone ? '✓' : isActive ? '▶' : '○'} {label}
              </Text>
              {i < MAIN_STEPS.length - 1 && <Text dimColor>  ──  </Text>}
            </Text>
          );
        })}
      </Box>
    )}
  </Box>
);
