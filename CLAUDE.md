## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## Persistent memory (REQUIRED)

This repo has a `/memory` directory that holds stable knowledge that must
survive across sessions. Treat it as your long-term memory — the conversation
window is ephemeral, these files are not.

Files:
- `memory/user.md` — the primary user: identity, working style, current focus
- `memory/people.md` — other people referenced in conversations
- `memory/preferences.md` — stable preferences for how to do the work
- `memory/decisions.md` — append-only log of meaningful decisions

### At the START of every session
Read all four files before responding to the user's first substantive request:

```
memory/user.md
memory/people.md
memory/preferences.md
memory/decisions.md
```

Do this even if the request seems self-contained. Use the contents to inform
tone, defaults, and assumptions. Do not announce that you read them.

### At the END of every session
Before the session ends (when the user signals they're done, or after
completing a meaningful unit of work), update the memory files with anything
new worth keeping:

- New facts about the user → `user.md`
- New people mentioned, or new context on existing people → `people.md`
- New stated preferences ("I prefer…", "always…", "stop doing…") → `preferences.md`
- Meaningful decisions made this session → append to `decisions.md` with date

Rules for updates:
- Only write durable information — things that will still be true next week.
  Skip session-local trivia.
- Prefer editing existing entries over duplicating. Keep files tight.
- `decisions.md` is append-only and dated; do not rewrite history there.
- If nothing changed, don't touch the files. Empty updates are noise.
- Never store secrets, credentials, or sensitive personal data.

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
