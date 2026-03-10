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
    <Box flexDirection="column" paddingLeft={1}>
      <Box marginBottom={1}>
        <Text color="yellow" bold>
          {stepKey === 'welcome' ? ':: How do you want to start?' : `:: Select ${label}`}
        </Text>
      </Box>
      <Box paddingLeft={1}>
        <SelectInput
          items={inkItems}
          onSelect={(item) => onSelect(item.value)}
          onHighlight={(item) => setFocused(item.value)}
        />
      </Box>
      <OptionDescription option={focusedOption} />
      <Box marginTop={1} paddingLeft={1}>
        <Text dimColor>Navigate </Text>
        <Text color="cyan" dimColor>↑↓</Text>
        <Text dimColor> │ Select </Text>
        <Text color="cyan" dimColor>Enter</Text>
      </Box>
    </Box>
  );
};
