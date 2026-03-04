# Architecture Policy

> Pattern: **feature-sliced** | State: **feature-based** | Styling: **utility-first**

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
│   │   │   # store, selectors, types — no side effects
│   │   ├── api/
│   │   │   # data fetching — async-await, map errors to domain types
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
│   │   │   # components — max 150 lines, no logic — extract to model
│   │   ├── model/
│   │   │   # store, selectors, types — no side effects
│   │   ├── api/
│   │   │   # data fetching — async-await, map errors to domain types
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
│   │   │   # components — max 150 lines, no logic — extract to model
│   │   ├── model/
│   │   │   # feature state, selectors — only for this feature
│   │   ├── api/
│   │   │   # feature-specific mutations — calls entity api, never raw fetch
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
│   │   │   # components — max 150 lines, no logic — extract to model
│   │   ├── model/
│   │   │   # entity state, selectors, types — pure business logic
│   │   ├── api/
│   │   │   # data access for this entity — maps to domain types, no raw responses
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
- **Framework-agnostic domain:** YES (no React/Axios/etc in entities)
- **Validation:** factory-function
- **Anemic model:** FORBIDDEN — business logic belongs in entities
- **Ubiquitous Language:** enforced

---

## File Conventions

### Naming

> Files: `camelCase` globally · Symbols: per-type rules below

| Type      | File Pattern      | Export Name Convention        |
| --------- | ----------------- | ----------------------------- | ---------------- |
| component | `*.component.tsx` | `PascalCase`                  |
| hook      | `*.hook.ts`       | `camelCase (use* prefix)`     |
| store     | `*.store.ts`      | `camelCase (*Store suffix)`   |
| service   | `*.service.ts`    | `camelCase (*Service suffix)` |
| types     | `*.types.ts`      | `PascalCase (\*Type           | \*Props suffix)` |
| constants | `*.constants.ts`  | `SCREAMING_SNAKE_CASE`        |

### Required Companions

| File Type | Required     | Optional    |
| --------- | ------------ | ----------- |
| component | `*.test.tsx` | —           |
| hook      | `*.test.ts`  | —           |
| store     | `*.test.ts`  | —           |
| service   | —            | `*.test.ts` |
| types     | —            | —           |
| constants | —            | —           |

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

---

## Component Composition Rules

- **Max lines:** 150
- **Max props:** 5 — split into compound component if exceeded
- **No prop drilling beyond depth 2** — lift to store or context
- **Logic in components:** FORBIDDEN — extract to hooks
- **Presentational components** must not import from `state` or `services` layers
- **Prefer composition over configuration:** YES — pass children/slots, avoid boolean prop explosion

---

## Abstraction Rules

- Extract to **hook** when: logic repeats across 2+ components OR exceeds 20 lines inside component
- Extract to **service** when: logic touches external I/O (API, storage, cookies)
- Extract to **utility** when: logic is pure, stateless, domain-agnostic
- **Do not abstract preemptively** — wrong abstraction costs more than duplication

---

## State & Async Rules

- **Scope:** feature-based
- **Derived state:** selectors
- **Data fetching:** entities, consumed via hooks
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

