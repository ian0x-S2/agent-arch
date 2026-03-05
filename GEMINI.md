# agent-arch

CLI that generates structured instruction bundles for AI coding agents.
Scope: frontend only. No scaffolding.

## Stack

TypeScript + Bun | React Ink (UI) | Commander (routing) | Valibot (validation)

## Core Law

The official interface is `policy.md`.

## Architecture

UI Layer (Ink) → Core (pure) → FileWriter
├── TemplateRegistry
├── PolicyComposer
├── MarkdownRenderer
└── TokenEstimator

## Data Flow

UserChoices → PolicyComposer(base + fragments) → PolicyObject → MarkdownRenderer → policy.md

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
renderer/ # policy → markdown, pure
token/ # estimates token count from MD, pure
writer/ # writes .ai/policy.md, only I/O in core
commands/ # init | generate | validate | render | estimate
bin.ts # commander entry, only routes to commands
schema/
policy.schema.ts # Internal schema source

## Wizard Flow

pattern → state → styling → routing → enforcement → mode → confirm → generate

## CLI Commands

agent-arch init # interactive wizard
agent-arch generate --pattern --naming --styling --framework --component-lib --preference
agent-arch validate [path] # defaults to .ai/policy.md
agent-arch render <patternId> # renders pattern from registry to console
agent-arch estimate [path] # defaults to .ai/policy.md
agent-arch registry list # list registered templates

## Layers & Import Matrix (feature-sliced default)

ui → hooks, state, types
hooks → state, services, types
state → services, types
services → types
types → (none)
circular_imports=FORBIDDEN | cross_feature=via-public-api-only

## Output Modes

Markdown is always verbose/complete by default.

## policy.md Contract

- Generated Markdown is the official system instruction for AI Agents.
- Declarative constraints only.
- Human-readable but machine-optimizable.
- Usable directly as LLM system instruction.
