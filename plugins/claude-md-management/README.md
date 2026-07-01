# claude-md-management

A Claude Code plugin for keeping `CLAUDE.md` files **lean, current, and
high-signal**. It ships slash commands to scaffold, audit, and optimize memory
files, an authoring skill with the underlying best-practice reference, and a
hook that warns when a `CLAUDE.md` grows past a size threshold.

## Why

`CLAUDE.md` is loaded into context on every session. Bloated, stale, or
duplicated memory files waste tokens and bury the instructions that matter.
This plugin gives you a repeatable way to manage them.

## Components

- **Commands** (`commands/`)
  - `/claude-md-management:init` — scaffold a well-structured `CLAUDE.md` for the
    current project or a subdirectory.
  - `/claude-md-management:audit` — review every `CLAUDE.md` in the repo for
    size, structure, duplication, and staleness, and report findings.
  - `/claude-md-management:optimize` — trim and refactor an existing `CLAUDE.md`
    into a concise, high-signal file without losing real instructions.
- **Skill** (`skills/claude-md-authoring`) — the CLAUDE.md best-practice
  reference the commands rely on. Invoke directly with
  `/claude-md-management:claude-md-authoring`.
- **Hook** (`hooks/hooks.json` → `scripts/check-claude-md-size.sh`): a
  `PostToolUse` hook on `Edit`/`Write`/`MultiEdit`. When the edited file is a
  `CLAUDE.md` that exceeds the line threshold, it prints a non-blocking warning.
  The default threshold is 250 lines; override with `CLAUDE_MD_MAX_LINES`.

## Install

From the `raysman-claude` marketplace:

```shell
/plugin marketplace add ericwingens/raysman-claude
/plugin install claude-md-management@raysman-claude
```

## Validate locally

```bash
claude plugin validate ./plugins/claude-md-management
```
