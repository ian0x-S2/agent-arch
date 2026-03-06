# Architecture Policy
> Pattern: **ui-lib** | State: **minimal** | Styling: **utility-first**

---

## Stack
- **Framework:** svelte

---

## Layer Rules
Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted**.

| Layer | May Import | Responsibilities | Side Effects |
|-------|------------|------------------|--------------|
| tokens | — | **Owns:** design tokens (color, spacing, typography, radius, shadow), CSS custom properties, theme contract<br>**Not:** import from any other layer, contain component logic, reference framework APIs | ✗ forbidden |
| primitives | tokens | **Owns:** unstyled base elements (Box, Text, Icon), accessibility attributes (aria-*, role), polymorphic `as` prop support<br>**Not:** apply visual styles directly, import from components or patterns, contain business logic | ✗ forbidden |
| components | primitives, tokens | **Owns:** compound components (Button.Root + Button.Icon), controlled and uncontrolled variants, component-scoped types and props interfaces<br>**Not:** import from patterns layer, fetch data or call APIs, contain application business logic | ✓ allowed |
| patterns | components, primitives, tokens | **Owns:** compositions of multiple components (Form, DataTable, Modal), higher-order interaction patterns<br>**Not:** be published as standalone primitives, introduce new tokens, import from consuming app layers | ✓ allowed |




**Cross-feature imports:** via public api only
**Circular imports:** FORBIDDEN

---

## Expected Directory Structure

```
src/
├── primitives/
│   ├── Box/
│   │   ├── Box.tsx         # unstyled, polymorphic
│   │   ├── Box.types.ts
│   │   └── index.ts
│   └── Text/
├── components/
│   ├── Button/
│   │   ├── Button.tsx          # namespace: Button.Root, Button.Icon
│   │   ├── Button.types.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts        # exports Button namespace
├── patterns/
│   ├── Form/
│   │   ├── Form.tsx        # composes components
│   │   └── index.ts
└── index.ts                # package root — public API only
```

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

### Publish Contract
- **package.json exports map:** required — every component gets its 
  own export path (`"./button": "./src/components/Button/index.ts"`)
- **Types exported:** YES — ship `.d.ts` alongside every component
- **Peer dependencies:** react, react-dom
- **Never bundle peer deps** — consumers provide them

---
## File Conventions

### Naming
> Files: `PascalCase` globally · Symbols: per-type rules below

| Type | File Pattern | Export Name Convention |
|------|--------------|------------------------|
| component | `*.svelte` | `PascalCase` |
| hook | `*.svelte.ts` | `camelCase (runes/logic functions)` |
| types | `*Types.ts` | `PascalCase (*Type | *Props suffix)` |
| constants | `*Constants.ts` | `SCREAMING_SNAKE_CASE` |
| tokens | `*.tokens.ts` | `—` |
| store | `*.svelte.ts` | `camelCase (reactive runes)` |


### Required Companions

| File Type | Required | Optional |
|-----------|----------|----------|
| component | `*.types.ts` + `*.test.ts` | — |
| hook | `*.test.ts` | — |
| types | — | — |
| constants | — | — |
| tokens | — | — |
| store | — | — |


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

---

## Component Composition Rules
- **Complexity signal:** extract to a separate component when the template has more than 2 logical sections, not by line count
- **Logic signal:** extract to `*.svelte.ts` when script block exceeds ~20-25 lines
- **Max props:** 10 — split into compound component if exceeded
- **No prop drilling beyond depth 2** — lift to store or context
- **Logic in components:** FORBIDDEN — extract to `*.svelte.ts`
- **Presentational components** must not import from `state` or `services` layers
- **Prefer composition over configuration:** YES — pass children/slots, avoid boolean prop explosion

---

## Abstraction Rules
- Extract to **`*.svelte.ts`** when: logic repeats across 2+ components OR exceeds 20-25 lines inside component
- Extract to **service** when: logic touches external I/O (API, storage, cookies)
- Extract to **utility** when: logic is pure, stateless, domain-agnostic
- **Do not abstract preemptively** — wrong abstraction costs more than duplication

---

## State & Async Rules
- **Scope:** minimal
- **Derived state:** selectors
- **Data fetching:** patterns, consumed via hooks
- **All promises must be handled** — no floating async calls
- **API errors must not reach UI raw** — map to domain error types in service layer
- **Every async UI operation requires** loading state + error state

---

## Type Rules
- **No `any`** — use `unknown` + type narrowing
- **Props interface required** per component — no inline type literals
- **No type assertions (`as`)** except at data boundaries (API responses, DOM events)

---

*Generated by agent-arch · [edit templates to change rules]*