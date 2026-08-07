# gstack-guard

A Claude Code plugin that enforces a global [gstack](https://github.com/garrytan/gstack)
install before any skill runs, and ships gstack setup + skill-routing guidance.

## Components

- **Hook** (`hooks/hooks.json` → `scripts/check-gstack.sh`): a `PreToolUse` hook
  on the `Skill` tool, graded into two tiers so it fails loudly without locking
  sandboxes out. Details always go to stderr.

  | Tier | Condition | Effect |
  | :--- | :-------- | :----- |
  | **Deny** | `~/.claude/skills/gstack/bin` missing | Skill invocation denied |
  | **Deny** | checkout incomplete (`VERSION`, `SKILL.md`, `bin/gstack-config`, `bin/gstack-paths`) | Skill invocation denied |
  | **Deny** | `bin/gstack-config` not executable | Skill invocation denied |
  | **Warn** | `~/.gstack/.last-setup-version` missing — `./setup` never finished | Allowed, `systemMessage` warning |
  | **Warn** | setup version ≠ checkout `VERSION` — stale install | Allowed, `systemMessage` warning |
  | **Warn** | `team_mode` not `true` in `~/.gstack/config.yaml` | Allowed, `systemMessage` warning |

  Incomplete setup only warns on purpose: gstack's `setup` runs under `set -e`
  and exits while installing Playwright's Chromium, before it writes
  `~/.gstack/.last-setup-version`. Sandboxed environments with a network
  allowlist land there legitimately, and non-browser skills still work — a hard
  block would lock them out of every skill.
- **Skill** (`skills/gstack-setup`): on-demand guidance to verify/install gstack
  and route requests to the right gstack skill. Invoke with
  `/gstack-guard:gstack-setup`.

## Install

From the `raysman-claude` marketplace:

```shell
/plugin marketplace add ericwingens/raysman-claude
/plugin install gstack-guard@raysman-claude
```

## Validate locally

```bash
claude plugin validate ./plugins/gstack-guard
```
