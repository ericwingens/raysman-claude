---
name: gstack-setup
description: Verify and install gstack (the required global skill toolkit) and explain skill routing. Use when gstack is missing or blocked, when a skill won't run, or when the user asks how to set up gstack for AI-assisted work in this repo.
---

# gstack setup & skill routing

gstack is required for all AI-assisted work in this repo. The `gstack-guard`
plugin enforces this with a `PreToolUse` hook on the `Skill` tool: if gstack is
not installed globally, skill invocations are denied with install instructions.

## 1. Verify gstack is installed

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

## 2. If GSTACK_MISSING, install it

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Then restart your AI coding tool. Do not skip skills, ignore gstack errors, or
work around a missing gstack.

> Note: `./setup --team` downloads a Playwright browser. In sandboxed
> environments with a network allowlist, that download may fail — gstack is
> still usable for non-browser skills as long as `~/.claude/skills/gstack/bin`
> exists.

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
