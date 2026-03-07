# Architecture Policy

> Pattern: **feature-sliced** | State: **feature-based** | Styling: **utility-first**

---

## Stack

- **Framework:** svelte

---

## Layer Rules

Imports are unidirectional. Each layer may only import from layers listed below it.
Violations of import rules are **not permitted**.

| Layer    | May Import                                 | Responsibilities                                                                                                                                | Side Effects |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| app      | pages, widgets, features, entities, shared | **Owns:** providers, routing, global styles, app initialization<br>**Not:** contain business logic                                              | ✗ forbidden  |
| pages    | widgets, features, entities, shared        | **Owns:** composition of widgets for a route<br>**Not:** contain business logic                                                                 | ✗ forbidden  |
| widgets  | features, entities, shared                 | **Owns:** composition of features, reusable page sections<br>**Not:** contain business logic directly                                           | ✗ forbidden  |
| features | entities, shared                           | **Owns:** user interactions with business value (AddToCart, LoginForm)<br>**Not:** import from other features, know about pages                 | ✓ allowed    |
| entities | shared                                     | **Owns:** business objects and their operations (User, Product, Order)<br>**Not:** import from features or above, contain UI components ideally | ✓ allowed    |
| shared   | —                                          | **Owns:** reusable infra with no business logic (ui-kit, api client, utils)<br>**Not:** import from any other layer, contain business logic     | ✗ forbidden  |

### Abstraction Boundaries

| Boundary          | Inner    | Outer    | Interface Required | Forbidden Leakage                                    |
| ----------------- | -------- | -------- | ------------------ | ---------------------------------------------------- |
| features→entities | entities | features | ✓ (model)          | API raw responses, implementation details of storage |

**Cross-feature imports:** via public api only
**Circular imports:** FORBIDDEN

---

## Expected Directory Structure

```
src/
├── app/
│   # imports: [pages, widgets, features, entities, shared]
│   # must not: contain business logic
├── pages/
│   # imports: [widgets, features, entities, shared]
│   # must not: contain business logic
│   ├── <slice>/          # business domain unit
│   │   ├── ui/
│   │   │   # route components only — compose widgets, no business logic
│   │   ├── model/
│   │   │   # reactive state (runes in .svelte.ts), types — no side effects
│   │   ├── api/
│   │   │   # follow SvelteKit conventions — +page.server.ts, +server.ts or remote functions
│   │   ├── lib/
│   │   │   # pure utils — stateless, no imports from ui or model
│   │   ├── config/
│   │   │   # constants, feature flags
│   │   └── index.ts      # public api — only export what consumers need
├── widgets/
│   # imports: [features, entities, shared]
│   # must not: contain business logic directly
│   ├── <slice>/          # business domain unit
│   │   ├── ui/
│   │   │   # components — extract if template > 2 logical sections, no logic — extract to model
│   │   ├── model/
│   │   │   # reactive state (runes in .svelte.ts), types — no side effects
│   │   ├── api/
│   │   │   # follow SvelteKit conventions — +page.server.ts, +server.ts or remote functions
│   │   ├── lib/
│   │   │   # pure utils — stateless, no imports from ui or model
│   │   ├── config/
│   │   │   # constants, feature flags
│   │   └── index.ts      # public api — only export what consumers need
├── features/
│   # imports: [entities, shared]
│   # must not: import from other features
│   ├── <slice>/          # business domain unit
│   │   ├── ui/
│   │   │   # components — extract if template > 2 logical sections, no logic — extract to model
│   │   ├── model/
│   │   │   # feature state (runes in .svelte.ts) — only for this feature
│   │   ├── api/
│   │   │   # server mutations — follow SvelteKit conventions (actions / remote functions), never fetch() in component
│   │   ├── lib/
│   │   │   # pure utils — stateless, no imports from ui or model
│   │   ├── config/
│   │   │   # constants, feature flags
│   │   └── index.ts      # public api — only export what consumers need
├── entities/
│   # imports: [shared]
│   # must not: import from features or above
│   ├── <slice>/          # business domain unit
│   │   ├── ui/
│   │   │   # components — extract if template > 2 logical sections, no logic — extract to model
│   │   ├── model/
│   │   │   # entity state (runes in .svelte.ts), types — pure business logic
│   │   ├── api/
│   │   │   # server data access — follow SvelteKit conventions (+page.server.ts / remote functions), map to domain types
│   │   ├── lib/
│   │   │   # pure utils — stateless, no imports from ui or model
│   │   ├── config/
│   │   │   # constants, feature flags
│   │   └── index.ts      # public api — only export what consumers need
├── shared/
│   # imports: [none]
│   # must not: import from any other layer
│   ├── ui-kit/           # design system primitives
│   ├── api/              # base http client, interceptors
│   ├── lib/              # pure utils — no business logic
│   └── types/            # global types only
```

---

## Domain Rules

- **Entities location:** `entities`
- **Value objects:** allowed
- **Immutable entities:** YES
- **Framework-agnostic domain:** YES
- **Validation:** factory-function
- **Anemic model:** FORBIDDEN — business logic belongs in entities
- **Ubiquitous Language:** enforced

---

## File Conventions

### Naming

> Files: `kebab-case` globally · Symbols: per-type rules below

| Type      | File Pattern     | Export Name Convention              |
| --------- | ---------------- | ----------------------------------- | ---------------- |
| component | `*.svelte`       | `PascalCase`                        |
| hook      | `*.svelte.ts`    | `camelCase (runes/logic functions)` |
| store     | `*.svelte.ts`    | `camelCase (reactive runes)`        |
| service   | `*.ts`           | `camelCase (*Service suffix)`       |
| types     | `*.types.ts`     | `PascalCase (\*Type                 | \*Props suffix)` |
| constants | `*.constants.ts` | `SCREAMING_SNAKE_CASE`              |

### Required Companions

| File Type | Required    | Optional    |
| --------- | ----------- | ----------- |
| component | `*.test.ts` | —           |
| hook      | `*.test.ts` | —           |
| store     | `*.test.ts` | —           |
| service   | —           | `*.test.ts` |
| types     | —           | —           |
| constants | —           | —           |

### Structure Rules

- **Co-location:** strict — companions must live beside source file
- **Test placement:** colocated
- **Public API:** every feature root requires `index.ts` — internal files must not be imported directly
- **Max directory depth:** 5
- **Barrel exports:** required at feature roots only

### Forbidden Patterns

- `default-export-on-utility`
- `barrel-in-non-feature-root`
- `named-export-mix-in-component-file`
- `legacy-stores-for-local-state`
- `effect-for-derived-state`
- `direct-mutation-outside-runes`

---

## Component Composition Rules

- **Complexity signal:** extract to a separate component when the template has more than 2 logical sections, not by line count
- **Logic signal:** extract to `*.svelte.ts` (Svelte logic module) when script block exceeds ~20-25 lines
- **Max props:** 10 — split into compound component if exceeded
- **No prop drilling beyond depth 2** — lift to store or context
- **Logic in components:** FORBIDDEN — extract to `*.svelte.ts` (Svelte logic module)
- **Presentational components** must not import from `state` or `services` layers
- **Prefer composition over configuration:** YES — pass children/slots, avoid boolean prop explosion

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

- **Scope:** feature-based
- **Derived state:** $derived rune (computed values)
- **Data fetching:** entities — pattern: async-await
- **All promises must be handled** — no floating async calls
- **API errors must not reach UI raw** — map to domain error types in service layer
- **Every async UI operation requires** loading state + error state

---

## Type Rules

- **No `any`** — use `unknown` + type narrowing
- **Props interface required** per component — no inline type literals
- **No type assertions (`as`)** except at data boundaries (API responses, DOM events)

---

_Generated by agent-arch · [edit templates to change rules]_
