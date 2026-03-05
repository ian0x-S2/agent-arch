import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export const ComponentLibStep = ({
  onSubmit,
}: {
  onSubmit: (value: string | undefined) => void;
}) => {
  const [value, setValue] = useState('');

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow" underline>
          Component Library
        </Text>
      </Box>
      <Box>
        <Text dimColor>Library name: </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={(val) => onSubmit(val.trim() || undefined)}
          placeholder="e.g. shadcn, MUI, Radix... (Enter to skip)"
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press Enter to skip</Text>
      </Box>
    </Box>
  );
};
