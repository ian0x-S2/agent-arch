import type { NamingStrategy, StylingStrategy, ComponentPreference } from './core/constants';

export type Step =
  | 'welcome'
  | 'pattern'
  | 'component_lib'
  | 'styling'
  | 'component_preference'
  | 'naming'
  | 'confirm'
  | 'generating'
  | 'done';

export interface OptionWithMeta {
  label: string;
  value: string;
  description: string;
  hint: string;
  impact?: string;
}

export interface UserSelections {
  pattern: string;
  output_mode: 'compact' | 'balanced' | 'verbose';
  naming_strategy?: NamingStrategy;
  styling_strategy?: StylingStrategy;
  component_lib?: string;
  component_preference?: ComponentPreference;
}
