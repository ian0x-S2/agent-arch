import React from 'react';
import { Box, Text } from 'ink';
import { Separator } from './Separator';

export const Header = ({ stepIndex }: { stepIndex: number }) => {
  const steps = [
    { label: 'Pattern' },
    { label: 'Library' },
    { label: 'Styling' },
    { label: 'Fetching' },
    { label: 'Preference' },
    { label: 'Done' },
  ];

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box paddingX={1} justifyContent="space-between">
        <Box>
          <Text color="white" bold>AGENT-ARCH</Text>
          <Text dimColor>  ·  </Text>
          <Text dimColor>AI Architecture Policy Designer</Text>
        </Box>
        {stepIndex !== -1 && (
          <Text dimColor>{stepIndex + 1}/{steps.length}</Text>
        )}
      </Box>
      <Separator />
      <Box paddingX={1} flexWrap="wrap">
        {steps.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = stepIndex !== -1 && i < stepIndex;
          return (
            <React.Fragment key={i}>
              <Box>
                <Text color={isActive ? 'cyan' : isDone ? 'white' : 'gray'}>
                  {s.label} {isDone ? '─●' : '─○'}
                </Text>
              </Box>
              {i < steps.length - 1 && (
                <Box paddingX={1}>
                  <Text dimColor>──</Text>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>
      <Separator />
    </Box>
  );
};
