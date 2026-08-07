## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed.** Run the same check the
`PreToolUse` hook enforces, so your preflight and the gate never disagree:

```bash
# Details (blocking reason or warnings) go to stderr and stay visible.
.claude/hooks/check-gstack.sh > /tmp/gstack-check.json
grep -q '"permissionDecision":"deny"' /tmp/gstack-check.json \
  && echo "GSTACK_BLOCKED" || echo "GSTACK_OK"
```

The check has two tiers:

- **Blocking** — gstack is absent, or the checkout is incomplete/not executable.
  Skills are denied outright.
- **Warning** — gstack runs, but `./setup --team` never finished, team mode is
  off, or the setup is stale. Skills still run. Sandboxed environments land here
  legitimately: gstack's `setup` runs under `set -e` and exits while installing
  Playwright's Chromium, before it writes `~/.gstack/.last-setup-version`.
  Surface the warning to the user; do not silently ignore it.

If GSTACK_BLOCKED: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> scripts/setup-claude-code.sh          # bootstraps gstack + council, or:
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
