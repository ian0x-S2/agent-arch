import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { OptionDescription, type OptionWithMeta } from './OptionDescription';

const STEP_LABELS: Record<string, string> = {
  welcome: 'Start',
  pattern: 'Pattern',
  styling: 'Styling',
  naming: 'Naming',
};

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

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow" underline>
          {stepKey === 'welcome' ? 'How do you want to start?' : `Select ${STEP_LABELS[stepKey]}`}
        </Text>
      </Box>
      <Box>
        <SelectInput
          items={inkItems}
          onSelect={(item) => onSelect(item.value)}
          onHighlight={(item) => setFocused(item.value)}
        />
      </Box>
      <OptionDescription option={focusedOption} />
      <Box marginTop={1}>
        <Text dimColor>Use ↑↓ to navigate, Enter to select</Text>
      </Box>
    </Box>
  );
};
