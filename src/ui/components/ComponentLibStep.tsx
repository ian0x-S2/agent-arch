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
        <Text color="yellow" bold>:: Component Library</Text>
      </Box>
      
      <Box paddingLeft={1} flexDirection="column">
        <Text dimColor>If you use a specific library (shadcn, melt, etc), mention it here.</Text>
        <Text dimColor>The agent will prioritize its primitives and components.</Text>
        
        <Box marginTop={1} paddingLeft={1}>
          <Text color="cyan">❯ </Text>
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={(val) => onSubmit(val.trim() || undefined)}
            placeholder="Library name or Enter to skip..."
          />
        </Box>
      </Box>

      <Box marginTop={1} paddingLeft={1}>
        <Text dimColor italic>Press </Text>
        <Text color="cyan" dimColor bold>Enter</Text>
        <Text dimColor italic> to continue</Text>
      </Box>
    </Box>
  );
};
