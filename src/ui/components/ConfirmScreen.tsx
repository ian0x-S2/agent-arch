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

  const summaryItems = [
    { label: 'Architecture', value: selections.pattern },
    { label: 'UI Library', value: selections.component_lib || 'None' },
    { label: 'Styling', value: selections.styling_strategy },
    { label: 'Data Fetching', value: selections.data_fetching },
    { label: 'Component API', value: selections.component_preference },
    { label: 'Naming', value: selections.naming_strategy },
    { label: 'State (derived)', value: derivedState, isDerived: true },
  ];

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow">Finalize your architecture</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {summaryItems.map((item, idx) => {
          if (!item.value) return null;
          return (
            <Box key={idx} marginBottom={0}>
              <Box width={20}>
                <Text dimColor>{item.label}</Text>
              </Box>
              <Text color={item.isDerived ? 'cyan' : 'green'} bold={!item.isDerived}>
                {item.value}
                {item.isDerived && <Text italic> (auto)</Text>}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} paddingY={1} borderStyle="single" borderColor="gray" paddingX={2} width={50} justifyContent="center">
        <Box marginRight={2}>
          <Text color="green" bold>↵ Confirm</Text>
        </Box>
        <Text color="yellow" bold>Esc Back</Text>
      </Box>
    </Box>
  );
};
