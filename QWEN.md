# Semantic Commit Instructions (Conventional Commits)

To keep the commit history clear and automatable, follow the **Conventional
Commits** convention. All commit messages must be written in English. Each
commit message should have the form:

```
type[optional scope]: short description

optional body

optional footer
```

## Common Types

- **feat**: a new feature
- **fix**: a bug fix
- **docs**: documentation only changes
- **style**: formatting, white-space, no code change
- **refactor**: code change that neither fixes a bug nor adds a feature
- **perf**: performance improvement
- **test**: adding or correcting tests
- **chore**: maintenance tasks and build process

## Scope

Optional, enclosed in parentheses immediately after the type with no spaces,
e.g. `feat(ui)`, `fix(api)`, or `chore(ci)`.

## Description

Use the imperative mood and do not end with a period. Be concise:
```
feat(auth): add JWT token validation
```

## Body (optional)

Explain what changed and why. Reference issues or tickets if necessary. Wrap lines
at 72 characters.

## Footer (optional)

Use for metadata such as:
- `BREAKING CHANGE:` description of a backwards-incompatible change
- `Closes #123` to automatically close an issue

## Examples

```
fix(parser): fix crash when parsing empty strings

The `parse()` function threw an exception when given an empty string. Added a
check and corresponding test.

Closes #42
```

```
feat(cli): support new validation command

Implements `agent-arch validate` and updates documentation.
```

---

Adopting this convention helps with automatic changelog generation, quick
identification of change types, and makes the history readable for the entire
team. All commits should be written in English to maintain consistency.
