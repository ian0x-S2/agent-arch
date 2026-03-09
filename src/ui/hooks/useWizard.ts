import { useState, useCallback } from 'react';
import type { Step, UserSelections } from '../../types';
import { MAIN_STEPS } from '../steps';

export const useWizard = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [selections, setSelections] = useState<Partial<UserSelections>>({});

  const nextStep = useCallback((currentStep: Step, value?: string) => {
    if (currentStep === 'welcome') {
      setStep('pattern');
      return;
    }

    const idx = MAIN_STEPS.indexOf(currentStep);
    let next: Step | undefined = MAIN_STEPS[idx + 1];

    const currentPattern = value && currentStep === 'pattern' ? value : selections.pattern;

    // Skip data_fetching for simple patterns
    if (next === 'data_fetching' && !['feature-sliced', 'modular', 'flat'].includes(currentPattern || '')) {
      next = MAIN_STEPS[idx + 2];
    }

    // Skip naming step for ui-lib pattern as it's enforced to PascalCase
    if (next === 'naming' && currentPattern === 'ui-lib') {
      next = 'confirm';
    }

    if (next) {
      setStep(next);
    }
  }, [selections.pattern]);

  const updateSelections = useCallback((mapping: Partial<UserSelections>) => {
    setSelections((prev) => ({ ...prev, ...mapping }));
  }, []);

  return {
    step,
    setStep,
    selections,
    updateSelections,
    nextStep,
  };
};
