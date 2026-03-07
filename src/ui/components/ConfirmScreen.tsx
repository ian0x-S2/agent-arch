import React from 'react';
import { Box, Text, useInput } from 'ink';
import { STATE_BY_PATTERN } from '../../core/shared/pattern-state';
import type { UserSelections } from '../../types';

export const ConfirmScreen = ({
  selections,
  onConfirm,
  onBack,
}: {
  selections: Partial<UserSelections>;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  useInput((input, key) => {
    if (key.return) onConfirm();
    if (key.escape || input === 'b') onBack();
  });

  const derivedState = STATE_BY_PATTERN[selections.pattern ?? '']?.philosophy ?? 'flexible';

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Text bold color="yellow" underline>Review & Confirm</Text>
      <Text dimColor>Verify your choices before generating the policy.</Text>

      <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan" underline>Selected Configuration</Text>
        </Box>
        <Box flexDirection="column">
          {(['pattern', 'component_lib', 'styling_strategy', 'component_preference', 'naming_strategy'] as const).map((key) => {
             const labelMap: Record<string, string> = {
               pattern: 'Architecture Pattern',
               component_lib: 'Component Library',
               styling_strategy: 'Styling Strategy',
               component_preference: 'Component Preference',
               naming_strategy: 'Naming Convention',
             };
             const val = (selections as any)[key];
             if (!val) return null;
             return (
              <Box key={key} marginBottom={0}>
                <Box width={25}>
                  <Text dimColor>{labelMap[key]}:</Text>
                </Box>
                <Text color="green" bold>{val}</Text>
              </Box>
             );
          })}
          <Box marginTop={1}>
            <Box width={25}>
              <Text dimColor>State Philosophy:</Text>
            </Box>
            <Text color="cyan" bold>{derivedState}</Text>
            <Text dimColor italic> (auto-derived)</Text>
          </Box>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="green" bold>↵ Enter </Text>
        <Text>to generate  </Text>
        <Text color="yellow" bold>Esc / b </Text>
        <Text>to go back</Text>
      </Box>
    </Box>
  );
};
