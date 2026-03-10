import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { OptionDescription, type OptionWithMeta } from './OptionDescription';
import { STEP_LABELS } from '../steps';

export const QuestionStep = ({
  stepKey,
  options,
  onSelect,
}: {
  stepKey: string;
  options: OptionWithMeta[];
  onSelect: (value: string) => void;
}) => {
  const [focused, setFocused] = useState(options[0]?.value ?? '');

  const inkItems = options.map((o) => ({ label: o.label, value: o.value }));
  const focusedOption = options.find((o) => o.value === focused);
  const label = STEP_LABELS[stepKey as keyof typeof STEP_LABELS] || stepKey;

  return (
    <Box flexDirection="column">
      <Box paddingX={1} marginBottom={1}>
        <Text color="white">{label}</Text>
      </Box>

      <Box paddingX={1} marginBottom={1}>
        <SelectInput
          items={inkItems}
          onSelect={(item) => onSelect(item.value)}
          onHighlight={(item) => setFocused(item.value)}
          indicatorComponent={({ isSelected }) => (
            <Box marginRight={1}>
              <Text color={isSelected ? 'cyan' : 'gray'}>{isSelected ? '❯' : ' '}</Text>
            </Box>
          )}
        />
      </Box>

      <OptionDescription option={focusedOption} />
    </Box>
  );
};
