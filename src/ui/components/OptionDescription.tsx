import React from 'react';
import { Box, Text } from 'ink';
import { Separator } from './Separator';

export interface OptionWithMeta {
  label: string;
  value: string;
  description: string;
  hint: string;
}

export const OptionDescription = ({ option }: { option: OptionWithMeta | undefined }) => {
  return (
    <Box flexDirection="column" width="100%">
      <Separator />
      <Box paddingX={1} minHeight={2}>
        {option ? (
          <Box flexDirection="column">
            <Text color="white">{option.description.toLowerCase()}</Text>
            <Text dimColor>{option.hint.toLowerCase()}</Text>
          </Box>
        ) : (
          <Text dimColor>select an option to see details</Text>
        )}
      </Box>
      <Separator />
      <Box paddingX={1}>
        <Text dimColor>↑↓ navigate · enter select · esc back</Text>
      </Box>
    </Box>
  );
};
