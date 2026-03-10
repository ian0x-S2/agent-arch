# agent-arch

CLI that generates structured architectural policy files (`policy.md`) for AI coding agents. Optimized for **Svelte 5 Runes** and modern frontend patterns.

```text
    ╔═╗  ╔═╗  ╔═╗  ╔╗╔  ╔╦╗  ───  ╔═╗  ╦═╗  ╔═╗  ╦ ╦
    ╠═╣  ║ ╦  ║╣   ║║║   ║   ───  ╠═╣  ╠╦╝  ║    ╠═╣
    ╩ ╩  ╚═╝  ╚═╝  ╝╚╝   ╩   ───  ╩ ╩  ╩╚═  ╚═╝  ╩ ╩

            architecture scaffolding for svelte
```

## 🎯 Purpose

AI Agents (like Cursor, Windsurf, or Gemini) perform better when constrained by a strict, declarative architecture policy. This tool automates the creation of those constraints, ensuring your AI assistant follows professional engineering standards.

## 🏗 Supported Patterns

- **Feature-Sliced (FSD):** Scalable enterprise pattern organized by business domains.
- **Modular Layered:** Classic technical layering (components, hooks, services).
- **Flat Layered:** Direct and minimal hierarchy for rapid development.
- **Atomic Design:** Organizes UI components by complexity (atoms → molecules).
- **UI Library:** Strict patterns for high-quality, publishable UI packages.

## 🛠 Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **UI:** [React Ink](https://github.com/vadimdemedes/ink) (Interactive CLI)
- **Validation:** [Valibot](https://valibot.io/)
- **Routing:** [Commander](https://github.com/tj/commander.js)

## 🚀 Getting Started

### Installation

```bash
bun install
```

### Usage

Run the interactive wizard to generate your policy:

```bash
bun run src/bin.ts init
```

### Commands

- `init`: start the interactive configuration wizard.
- `validate [path]`: check if an existing `policy.md` complies with the schema.
- `registry list`: list all available architectural templates.

## 📜 Policy Contract

The generated `.ai/policy.md` acts as the **Single Source of Truth** for:

- **Layer Rules:** Who can import from whom.
- **File Conventions:** Naming, extensions, and exports.
- **Implementation Rules:**
  - `is/has/can` prefix for booleans.
  - typed errors (no raw strings).
  - extracted magic numbers (\*.constants.ts).

## 🧪 Development

```bash
# Run tests
bun test

# Run in development mode
bun run src/bin.ts <command>
```

---

built with precision for the svelte ecosystem.
