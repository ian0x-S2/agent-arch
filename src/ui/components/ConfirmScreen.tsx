import React from 'react';
import { Box, Text, useInput } from 'ink';
import { STATE_BY_PATTERN } from '../../core/shared/pattern-state';
import type { UserSelections } from '../../types';
import { Separator } from './Separator';

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
    { label: 'pattern', value: selections.pattern },
    { label: 'ui library', value: selections.component_lib || 'none' },
    { label: 'styling', value: selections.styling_strategy },
    { label: 'fetching', value: selections.data_fetching },
    { label: 'component api', value: selections.component_preference },
    { label: 'naming', value: selections.naming_strategy },
    { label: 'state', value: derivedState },
  ];

  return (
    <Box flexDirection="column">
      <Box paddingX={1} marginBottom={1}>
        <Text color="white">Review your architecture</Text>
      </Box>

      <Box flexDirection="column" paddingX={1} marginBottom={1}>
        {summaryItems.map((item, idx) => {
          if (!item.value) return null;
          return (
            <Box key={idx} marginBottom={0}>
              <Box width={20}>
                <Text dimColor>{item.label.toLowerCase()}</Text>
              </Box>
              <Text color="white">
                {String(item.value).toLowerCase().replace(/-/g, ' ')}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Separator />
      <Box paddingX={1}>
        <Text dimColor>enter confirm · esc back</Text>
      </Box>
    </Box>
  );
};
