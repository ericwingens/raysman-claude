# gstack-guard

A Claude Code plugin that enforces a global [gstack](https://github.com/garrytan/gstack)
install before any skill runs, and ships gstack setup + skill-routing guidance.

## Components

- **Hook** (`hooks/hooks.json` → `scripts/check-gstack.sh`): a `PreToolUse` hook
  on the `Skill` tool. If `~/.claude/skills/gstack/bin` does not exist, the skill
  invocation is denied and install instructions are printed to stderr.
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
