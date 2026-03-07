# Architecture Policy

> Pattern: **ui-lib** | State: **minimal** | Styling: **utility-first**

---

## Stack

- **Framework:** svelte

---

## Layer Rules

Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted**.

| Layer      | May Import             | Responsibilities                                                                                                                                                                                                                                                        | Side Effects |
| ---------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| primitives | —                      | **Owns:** unstyled base elements (Box, Text, Icon), accessibility attributes (aria-\*, role), rest props spread via `$props()` for full HTML attribute passthrough<br>**Not:** apply visual styles directly, import from components or patterns, contain business logic | ✗ forbidden  |
| components | primitives             | **Owns:** compound components (Button.Root + Button.Icon), controlled and uncontrolled variants, component-scoped types and props interfaces<br>**Not:** import from patterns layer, fetch data or call APIs, contain application business logic                        | ✓ allowed    |
| patterns   | components, primitives | **Owns:** compositions of multiple components (Form, DataTable, Modal), higher-order interaction patterns<br>**Not:** be published as standalone primitives, introduce new tokens, import from consuming app layers                                                     | ✓ allowed    |

**Cross-feature imports:** via public api only
**Circular imports:** FORBIDDEN

---

## Expected Directory Structure

```
src/
├── primitives/
│   ├── Box/
│   │   ├── Box.svelte         # unstyled, polymorphic
│   │   ├── Box.types.ts
│   │   └── index.ts
│   └── Text/
├── components/
│   ├── Button/
│   │   ├── Button.svelte          # namespace: Button.Root, Button.Icon
│   │   ├── Button.context.svelte.ts  # shared $state for compound parts via Svelte Context
│   │   ├── Button.types.ts
│   │   ├── Button.test.ts
│   │   └── index.ts        # exports Button namespace
├── patterns/
│   ├── Form/
│   │   ├── Form.svelte        # composes components
│   │   └── index.ts
└── index.ts                # package root — public API only
```

> **Depth note:** max depth 3 is intentional — compound component state lives beside the component as `*.context.svelte.ts`, never in a subdirectory. Context files are private to the component folder and must not be exported via `index.ts`.

---

## UI Library Rules

### Design Tokens (Utility-First Mode)

- **Primary Source:** Tailwind/UnoCSS Config
- **Rule:** Use strictly Tailwind utility classes. Do NOT use arbitrary values.
- **Customization:** If a specific brand color is needed, add it to the config, not hardcoded in components.
- **Forbidden:** `arbitrary-values-in-utils` (e.g., `text-[14px]` → use `text-sm` instead)

### Compound Component Pattern

- **Enforced:** YES
- **Export style:** `namespace`
- Exports as `Button.Root`, `Button.Trigger`, `Button.Icon`
- Root component is the namespace object — never export parts standalone
  > Svelte 5+: use `children: Snippet` + `$props()` rest spread. No `as` prop needed.

### Publish Contract

- **package.json exports map:** required — every component gets its
  own export path (`"./button": "./src/components/Button/index.ts"`)
- **Types exported:** YES — ship `.d.ts` alongside every component
- **Peer dependencies:** svelte
- **Never bundle peer deps** — consumers provide them

---

## File Conventions

### Naming

> **Component files:** `PascalCase` · **Utility files:** `camelCase` · Symbols: per-type rules below

| Type      | File Pattern     | Export Name Convention              |
| --------- | ---------------- | ----------------------------------- | ---------------- |
| component | `*.svelte`       | `PascalCase`                        |
| hook      | `*.svelte.ts`    | `camelCase (runes/logic functions)` |
| types     | `*.types.ts`     | `PascalCase (\*Type                 | \*Props suffix)` |
| constants | `*.constants.ts` | `SCREAMING_SNAKE_CASE`              |
| store     | `*.svelte.ts`    | `camelCase (reactive runes)`        |
| service   | `*.ts`           | `camelCase`                         |

### Required Companions

| File Type | Required                   | Optional |
| --------- | -------------------------- | -------- |
| component | `*.types.ts` + `*.test.ts` | —        |
| hook      | `*.test.ts`                | —        |
| types     | —                          | —        |
| constants | —                          | —        |
| store     | —                          | —        |
| service   | —                          | —        |

### Structure Rules

- **Co-location:** strict — companions must live beside source file
- **Test placement:** colocated
- **Public API:** every feature root requires `index.ts` — internal files must not be imported directly
- **Max directory depth:** 3
- **Barrel exports:** required at feature roots only

### Forbidden Patterns

- `default-export-on-component`
- `arbitrary-values-in-utils`
- `compound-part-exported-without-namespace`
- `legacy-stores-for-local-state`
- `effect-for-derived-state`
- `direct-mutation-outside-runes`

---

## Component API Design Rules

- **API philosophy:** Hybrid — common variations as props, structural extensions as compound parts
- **Max props per component:** 10 — split into compound parts if exceeded
- **Separate style props from behavior props** — `variant`, `size` are style; `onClick`, `disabled` are behavior
- **All props must be typed** — no `[key: string]: any` escape hatches
- **No prop drilling beyond depth 2** — use scoped Context for compound internals
- **Logic in components:** FORBIDDEN — extract to `*.svelte.ts` (Svelte logic module)
- **Prefer composition over configuration:** YES — pass children/slots, avoid boolean prop explosion
- **Primitives accept `children: Snippet` and spread rest props via `$props()`** — the consumer controls wrapping; no `as` prop needed

---

## Abstraction Rules

- Extract to **`*.svelte.ts` (Svelte logic module)** when: logic repeats across 2+ components OR exceeds 20-25 lines inside component
- Extract to **service** when: logic touches external I/O (API, storage, cookies)
- Extract to **utility** when: logic is pure, stateless, domain-agnostic
- **Do not abstract preemptively** — wrong abstraction costs more than duplication

---

## Svelte 5 Runes Contract

- **`$state`** → local reactive state (avoid legacy `let` variables for state)
- **`$derived`** → computed values; replaces selectors and reactive declarations
- **`$effect`** → side effects only (DOM, subscriptions); **forbidden for syncing state**
- **`$props`** → official component interface; no more `export let`
- **`$bindable`** → explicit two-way binding; use sparingly to maintain data flow clarity

---

## State & Async Rules

- **Philosophy:** UI-only state — this library does NOT manage application state
- **Allowed:** component-internal UI state only (`$state` rune) — e.g. `isOpen`, `isFocused`, `isDisabled`
- **Compound component state sharing:** via scoped Context — never exposed outside the component boundary
- **FORBIDDEN:** global state managers (Svelte stores at module level)
- **FORBIDDEN:** fetching data or managing server state inside the library
- **FORBIDDEN:** sharing state between unrelated components via module-level variables
- **Props & callbacks** are the public contract — consumers own the state, the lib only reflects it
- **All promises must be handled** — no floating async calls
- **Every async UI operation requires** loading state + error state

---

## Type Rules

- **No `any`** — use `unknown` + type narrowing
- **Props interface required** per component — no inline type literals
- **No type assertions (`as`)** except at data boundaries (API responses, DOM events)

---

_Generated by agent-arch · [edit templates to change rules]_
