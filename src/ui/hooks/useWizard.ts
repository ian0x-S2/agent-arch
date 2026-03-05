import { useState, useCallback } from 'react';
import type { Step, UserSelections } from '../../types';
import { GUIDED_STEPS } from '../steps';

export const useWizard = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [selections, setSelections] = useState<Partial<UserSelections>>({});

  const nextStep = useCallback((currentStep: Step, value?: string) => {
    if (currentStep === 'welcome') {
      setStep('pattern');
      return;
    }

    const idx = GUIDED_STEPS.indexOf(currentStep);
    let next: Step | undefined = GUIDED_STEPS[idx + 1];

    if (next) {
      setStep(next);
    }
  }, []);

  const updateSelections = useCallback((mapping: Partial<UserSelections>) => {
    setSelections((prev) => ({ ...prev, ...mapping, output_mode: prev.output_mode || 'compact' }));
  }, []);

  return {
    step,
    setStep,
    selections,
    updateSelections,
    nextStep,
  };
};
