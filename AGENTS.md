# agent-arch

CLI that generates structured instruction bundles for AI coding agents.
Output: `.ai/policy.json` (source of truth) → `system.prompt.txt` + optional `policy.md`
Scope: frontend only. No scaffolding. No framework assumptions.

## Stack

TypeScript + Bun | React Ink (UI) | Commander (routing) | Valibot (validation)

## Core Law

JSON → prompt. Never the inverse. Core has zero Ink dependency.

## Architecture

UI Layer (Ink) → Core (pure) → FileWriter
├── TemplateRegistry
├── PolicyComposer
├── PromptRenderer
└── TokenEstimator

## Data Flow

UserChoices → PolicyComposer(base + fragments) → policy.json → Renderer → [prompt, md]

## Folder Structure

src/
ui/
app.tsx # root, manages screen flow
screens/ # WizardScreen | GeneratingScreen | SummaryScreen
components/ # Question | ProgressBar | Badge | FileTree
hooks/ # useWizard (state machine) | useGenerate (calls core)
core/
registry/ # loads JSON templates, pure
composer/ # merges base + fragments → policy object, pure
renderer/ # policy → prompt string | markdown, pure
token/ # estimates token count, pure
writer/ # writes .ai/ files, only I/O in core
commands/ # init | generate | validate | render-cmd
bin.ts # commander entry, only routes to commands
schema/
policy.schema.ts # Zod schema = single schema source

## Wizard Flow

pattern → state → styling → routing → enforcement → mode → confirm → generate

## policy.json Shape

meta: { version, generated_at, output_mode, token_budget, enforcement }
stack: { domain, pattern, state_philosophy, styling_strategy, routing_strategy }
layers: [{ id, allowed_imports[], forbidden_imports[] }]
import_matrix: { [layer_id]: [permitted_targets] }
structural_constraints:{ max_component_depth, barrel_exports_required, circular_imports, cross_feature_imports }
ui_constraints: { component_max_lines, logic_in_components, style_co_location, allowed_style_extensions }
state_constraints: { global_state_scope, local_state_allowed, derived_state_strategy, forbidden_patterns[] }
side_effect_boundaries:{ allowed_in_layers[], forbidden_in_layers[], async_pattern, data_fetching_scope }
naming_conventions: { component, hook, store, service, constant, type, test }
file_conventions: { allowed_extensions[], naming_patterns{}, required_companions{}, directory{}, public_api{}, test_placement, forbidden_patterns[] }
token_metadata: { estimated_prompt_tokens, compression_applied, omitted_sections[] }

## file_conventions Rules

naming*patterns: component=*.component.tsx | hook=_.hook.ts | store=_.store.ts | service=_.service.ts | type=_.types.ts | test=\_.test.ts
required_companions: component→[style,test] | hook→[test] | store→[test]
colocation: strict — style+test live beside source
public_api: index file required per feature root, expose_internals=forbidden
test_placement: colocated
forbidden_patterns: default-export-on-utility | barrel-in-non-feature-root

## CLI Commands

agent-arch init # interactive wizard
agent-arch generate --pattern --state --styling --routing --enforcement --mode --output
agent-arch validate --policy .ai/policy.json
agent-arch render --policy .ai/policy.json --format [prompt|markdown]
agent-arch estimate --policy .ai/policy.json --mode compact
agent-arch registry list [--type pattern|fragment]

## Layers & Import Matrix (feature-sliced default)

ui → hooks, state, types
hooks → state, services, types
state → services, types
services → types
types → (none)
circular_imports=FORBIDDEN | cross_feature=via-public-api-only

## Enforcement Levels

strict — violations must not be introduced
moderate — violations trigger warnings
relaxed — advisory only

## Output Modes

compact — token-optimized, no commentary, declarative only (~390 tokens)
balanced — structured + light descriptions
verbose — full definitions + rationale

## system.prompt.txt Contract

- Derived strictly from policy.json
- No human commentary
- Declarative constraints only
- Token-optimized per selected mode
- Usable directly as LLM system instruction

## Implementation Rules

- Core modules = pure functions, no I/O, fully testable without CLI
- Only FileWriter and commands/ may perform I/O
- New patterns: drop JSON in registry/templates/
- New fragments: drop JSON in registry/fragments/
- New renderers: implement Renderer interface

## Build Order

1. core/ — test with plain scripts
2. ui/app.tsx — verify Ink renders
3. useWizard + useGenerate — connect to core
4. bin.ts + commander — last
