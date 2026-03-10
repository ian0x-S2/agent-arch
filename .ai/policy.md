# Architecture Policy
Pattern: ui-lib | Framework: Svelte 5 | Styling: utility-first

## Layers & Import Direction
patterns → components → primitives (unidirectional, strict)

| Layer      | May Import              |
|------------|-------------------------|
| patterns   | components, primitives  |
| components | primitives              |
| primitives | —                       |

- Circular imports: FORBIDDEN
- Cross-layer imports must go through index.ts

## Directory Structure
src/
├── primitives/<Component>/
│   ├── Component.svelte        # unstyled, polymorphic — aria/role only
│   ├── Component.types.ts
│   └── index.ts
├── components/<Component>/
│   ├── Component.svelte        # compound: Component.Root, Component.Icon
│   ├── Component.context.svelte.ts  # scoped $state for compound parts — not exported
│   ├── Component.types.ts
│   ├── Component.test.ts
│   └── index.ts                # exports Component namespace
├── patterns/<Pattern>/
│   ├── Pattern.svelte          # composes multiple components
│   └── index.ts
└── index.ts                    # package root — public API only

## File Conventions
| Type      | File                | Export          |
|-----------|---------------------|-----------------|
| component | *.svelte            | PascalCase      |
| context   | *.context.svelte.ts | camelCase       |
| hook      | *.svelte.ts         | camelCase       |
| types     | *.types.ts          | PascalCase      |
| constants | *.constants.ts      | SCREAMING_SNAKE |

- Component files: PascalCase | Utility files: kebab-case
- inline magic numbers — extract to named constants (*.constants.ts)
- errors must be typed — no throwing raw strings
- boolean variables must use is/has/can prefix
- Barrel exports: required at every component root
- Context files: private — never exported via index.ts

## Component Rules
- No business logic at any layer
- No data fetching at any layer
- Support controlled and uncontrolled variants — controlled via props, uncontrolled via default* props
- Extract to *.svelte.ts when script > 25 lines or logic repeats across 2+ components
- Max props: 5 — split into compound parts if exceeded
- Separate style props from behavior props (variant/size vs onClick/disabled)
- No prop drilling beyond depth 2 — use scoped Context for compound internals
- Primitives accept children: Snippet and spread rest props via $props() — no as prop
- Prefer composition over configuration (slots over boolean props)

## Compound Component Pattern
- Export style: namespace (Button.Root, Button.Icon, Button.Trigger)
- Never export compound parts standalone
- Compound state shared via *.context.svelte.ts — never exposed outside component boundary

## Svelte 5 Runes
- $state → UI-only component state (isOpen, isFocused, isDisabled)
- $derived → computed values (never $effect for derived state)
- $effect → side effects only (DOM, subscriptions)
- $props → component interface
- $bindable → explicit two-way binding (use sparingly)
- No legacy stores for local state

## Publish Contract
- package.json exports map required — every component gets its own export path
- Types exported — ship .d.ts alongside every component
- Peer dependency: svelte — never bundle peer deps

## Forbidden
- Circular imports
- Arbitrary Tailwind values (text-[14px] → use text-sm)
- Business logic at any layer
- Data fetching at any layer
- Global state managers
- Module-level shared state between unrelated components
- Exporting context files via index.ts
- Standalone export of compound parts
- any type (use unknown + narrowing)
- Type assertions (as) except at data boundaries