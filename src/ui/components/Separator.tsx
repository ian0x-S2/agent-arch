import React, { useState, useEffect } from 'react';
import { Box, Text, useStdout } from 'ink';

export const Separator = ({ color = 'gray', dim = true }: { color?: string; dim?: boolean }) => {
  const { stdout } = useStdout();
  const [width, setWidth] = useState(stdout?.columns || 80);

  useEffect(() => {
    const onResize = () => setWidth(stdout?.columns || 80);
    stdout?.on('resize', onResize);
    return () => {
      stdout?.off('resize', onResize);
    };
  }, [stdout]);

  return (
    <Box width="100%">
      <Text color={color} dimColor={dim}>
        {'─'.repeat(width)}
      </Text>
    </Box>
  );
};
