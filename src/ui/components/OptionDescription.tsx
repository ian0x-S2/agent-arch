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
    <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="blue" paddingX={2} paddingY={1}>
      <Text bold color="white">Description</Text>
      <Text color="white">{option.description}</Text>
      <Box marginTop={1}>
        <Text dimColor italic>💡 {option.hint}</Text>
      </Box>
      {option.impact && (
        <Box marginTop={1}>
          <Text color="yellow" bold>{option.impact}</Text>
        </Box>
      )}
    </Box>
  );
};
