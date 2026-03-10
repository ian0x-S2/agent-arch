import React from 'react';
import { Box, Text, useInput } from 'ink';

export const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  useInput((input, key) => {
    if (key.return) onStart();
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          {`
    ╔═╗  ╔═╗  ╔═╗  ╔╗╔  ╔╦╗  ───  ╔═╗  ╦═╗  ╔═╗  ╦ ╦
    ╠═╣  ║ ╦  ║╣   ║║║   ║   ───  ╠═╣  ╠╦╝  ║    ╠═╣
    ╩ ╩  ╚═╝  ╚═╝  ╝╚╝   ╩   ───  ╩ ╩  ╩╚═  ╚═╝  ╩ ╩

            architecture scaffolding for svelte
          `}
        </Text>
      </Box>

      <Box flexDirection="column" paddingLeft={2}>
        <Text italic dimColor>
          Elevate your AI agent efficiency with 
          <Text color="cyan"> strict architectural enforcement.</Text>
        </Text>
        
        <Box marginTop={1} flexDirection="column">
          <Text>Design your <Text color="yellow" bold>policy.md</Text> for:</Text>
          <Box marginLeft={2} marginTop={1} flexDirection="column">
            <Text dimColor>● Clean technical boundaries</Text>
            <Text dimColor>● Unidirectional data flow</Text>
            <Text dimColor>● Consistent naming conventions</Text>
          </Box>
        </Box>

        <Box marginTop={2} paddingY={1} width={40} borderStyle="single" borderColor="gray" justifyContent="center">
          <Text color="green" bold>↵ Press Enter </Text>
          <Text dimColor>to begin configuration</Text>
        </Box>
      </Box>
    </Box>
  );
};
