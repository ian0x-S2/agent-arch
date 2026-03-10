import React from 'react';
import { Box, Text } from 'ink';

export interface OptionWithMeta {
  label: string;
  value: string;
  description: string;
  hint: string;
  impact?: string;
}

export const OptionDescription = ({ option }: { option: OptionWithMeta | undefined }) => {
  if (!option) return null;
  return (
    <Box flexDirection="column" marginTop={1} paddingLeft={2}>
      <Box marginBottom={1}>
        <Text color="gray" dimColor>─────────────────────────────────────────────</Text>
      </Box>
      <Box marginBottom={0}>
        <Text color="white">{option.description}</Text>
      </Box>
      <Box marginTop={0}>
        <Text color="white" dimColor>{option.hint}</Text>
      </Box>
      {option.impact && (
        <Box marginTop={1}>
          <Text color="yellow" bold>{option.impact}</Text>
        </Box>
      )}
    </Box>
  );
};
