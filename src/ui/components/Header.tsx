import React from 'react';
import { Box, Text } from 'ink';
import { STEP_LABELS, MAIN_STEPS } from '../steps';

export const Header = ({ step, stepIndex, totalSteps }: { step: string; stepIndex: number; totalSteps: number }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box paddingX={1} marginBottom={1}>
      <Text color="cyan" bold>AGENT-ARCH </Text>
      <Text dimColor>│ </Text>
      <Text italic dimColor>AI Architecture Policy Designer</Text>
    </Box>
    {totalSteps > 1 && (
      <Box paddingX={1}>
        {MAIN_STEPS.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = stepIndex !== -1 && i < stepIndex;
          const label = STEP_LABELS[s] || s;
          return (
            <React.Fragment key={s}>
              <Box>
                <Text color={isDone ? 'green' : isActive ? 'cyan' : 'gray'} bold={isActive}>
                  {isDone ? '●' : isActive ? '▶' : '○'} {label}
                </Text>
              </Box>
              {i < MAIN_STEPS.length - 1 && (
                <Box paddingX={1}>
                  <Text dimColor>─</Text>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    )}
  </Box>
);
