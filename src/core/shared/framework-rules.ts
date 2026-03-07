import type { Policy } from "../../schema/policy.schema";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export const SVELTE_OVERRIDES: DeepPartial<Policy> = {
  naming_conventions: {
    hook: "camelCase (runes/logic functions)",
    component: "PascalCase",
    store: "camelCase (reactive runes)",
  },
  file_conventions: {
    types: {
      component: {
        pattern: "*.svelte",
        companions: {
          test: { required: true, extensions: [".test.ts", ".spec.ts"] },
        },
      },
      store: { pattern: "*.svelte.ts" },
      hook: { pattern: "*.svelte.ts" },
      service: { pattern: "*.ts" },
    },
    forbidden_patterns: [
      "legacy-stores-for-local-state",
      "effect-for-derived-state",
      "direct-mutation-outside-runes"
    ],
  },
  state_constraints: {
    local_state_allowed: true,
    derived_state_strategy: "$derived rune (computed values)",
    forbidden_patterns: [
      "direct-mutation",
      "prop-drilling",
      "untemplated-$effect"
    ],
  },
};
