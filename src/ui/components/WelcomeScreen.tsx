import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from './Header';
import { Separator } from './Separator';

export const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  useInput((input, key) => {
    if (key.return) onStart();
  });

  return (
    <Box flexDirection="column" width="100%">
      <Header stepIndex={-1} />
      
      <Box paddingX={4} paddingY={1} flexDirection="column" alignItems="flex-start">
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

        <Box flexDirection="column" paddingLeft={2} marginTop={1}>
          <Text italic dimColor>
            elevate your ai agent efficiency with 
            <Text color="cyan"> strict architectural enforcement.</Text>
          </Text>
          
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>● clean technical boundaries</Text>
            <Text dimColor>● unidirectional data flow</Text>
            <Text dimColor>● consistent naming conventions</Text>
          </Box>
        </Box>
      </Box>

      <Separator />
      <Box paddingX={1}>
        <Text dimColor>press enter to begin configuration · esc back</Text>
      </Box>
    </Box>
  );
};
