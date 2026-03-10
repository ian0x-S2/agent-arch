import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { OptionDescription } from './OptionDescription';

export const ComponentLibStep = ({
  onSubmit,
}: {
  onSubmit: (value: string | undefined) => void;
}) => {
  const [value, setValue] = useState('');

  return (
    <Box flexDirection="column">
      <Box paddingX={1} marginBottom={1}>
        <Text color="white">Library</Text>
      </Box>

      <Box paddingX={1} marginBottom={1} minHeight={4} flexDirection="column">
        <Box flexDirection="column">
          <Text dimColor>if you use a specific library (shadcn, melt, etc), mention it here.</Text>
          <Text dimColor>the agent will prioritize its primitives and components.</Text>
        </Box>

        <Box marginTop={1}>
          <Text color="cyan">❯ </Text>
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={(val) => onSubmit(val.trim() || undefined)}
            placeholder="library name or enter to skip..."
          />
        </Box>
      </Box>

      <OptionDescription option={undefined} />
    </Box>
  );
};
