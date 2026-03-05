import type { Policy } from "../../schema/policy.schema";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export const FRAMEWORK_OVERRIDES: Record<string, DeepPartial<Policy>> = {
  react: {
    naming_conventions: {
      hook: "camelCase (use* prefix)",
    },
    file_conventions: {
      types: {
        hook: { pattern: "use*.ts" },
      },
    },
  },
  vue: {
    naming_conventions: {
      hook: "camelCase (use* prefix — composables)",
    },
    file_conventions: {
      types: {
        component: {
          pattern: "*.vue",
          companions: {
            test: { required: true, extensions: [".test.ts", ".spec.ts"] },
          },
        },
        hook: { pattern: "use*.ts" },
      },
    },
    side_effect_boundaries: {
      async_pattern: "async-await",
    },
  },
  svelte: {
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
      },
    },
    state_constraints: {
      forbidden_patterns: ["direct-mutation", "prop-drilling"],
    },
  },
};
