---
name: gstack-setup
description: Verify and install gstack (the required global skill toolkit) and explain skill routing. Use when gstack is missing or blocked, when a skill won't run, or when the user asks how to set up gstack for AI-assisted work in this repo.
---

# gstack setup & skill routing

gstack is required for all AI-assisted work in this repo. The `gstack-guard`
plugin enforces this with a `PreToolUse` hook on the `Skill` tool. The hook is
graded: a missing or broken install **denies** the skill invocation, while an
install that merely never finished `setup` **warns** and lets the skill run.

## 1. Verify gstack is installed

Run the hook itself, so this check and the enforced gate never disagree:

```bash
# Prefer the plugin's copy; fall back to the repo copy (identical script).
for c in "${CLAUDE_PLUGIN_ROOT:-}/scripts/check-gstack.sh" \
         "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/check-gstack.sh"; do
  [ -x "$c" ] && CHECK="$c" && break
done
# Details (blocking reason or warnings) go to stderr and stay visible.
"$CHECK" > /tmp/gstack-check.json
grep -q '"permissionDecision":"deny"' /tmp/gstack-check.json \
  && echo "GSTACK_BLOCKED" || echo "GSTACK_OK"
```

`GSTACK_BLOCKED` means one of: `~/.claude/skills/gstack/bin` is missing, the
checkout is incomplete, or `bin/gstack-config` is not executable.

## 2. If GSTACK_BLOCKED, install it

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Then restart your AI coding tool. Do not skip skills, ignore gstack errors, or
work around a missing gstack.

## 2b. If you get a warning instead

A warning means gstack runs but the install is not what CLAUDE.md asks for —
`setup` never completed, `team_mode` is off, or the setup is stale. Re-running
`cd ~/.claude/skills/gstack && ./setup --team` clears all three.

> Note: `./setup --team` downloads a Playwright browser, and it runs under
> `set -e` — in sandboxed environments with a network allowlist that download
> fails and setup exits *before* writing `~/.gstack/.last-setup-version`. That
> is why an unfinished setup only warns: non-browser skills still work, but
> browser-backed ones (`/browse`, `/qa`) will not. Report the warning to the
> user rather than ignoring it.

## 3. Skill routing

After install, gstack skills like `/qa`, `/ship`, `/review`, `/investigate`,
and `/browse` are available. Use `/browse` for all web browsing. Reference
gstack files at the global path `~/.claude/skills/gstack/...`.

When a request matches an available skill, invoke it. Key routing rules:

- Product ideas / brainstorming → `/office-hours`
- Strategy / scope → `/plan-ceo-review`
- Architecture → `/plan-eng-review`
- Design system / plan review → `/design-consultation` or `/plan-design-review`
- Full review pipeline → `/autoplan`
- Bugs / errors → `/investigate`
- QA / testing site behavior → `/qa` or `/qa-only`
- Code review / diff check → `/review`
- Visual polish → `/design-review`
- Ship / deploy / PR → `/ship` or `/land-and-deploy`
- Save progress → `/context-save`
- Resume context → `/context-restore`
