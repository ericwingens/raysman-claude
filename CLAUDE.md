## gstack (REQUIRED — global install)

Skill invocations in this repo are gated by `.claude/hooks/check-gstack.sh`,
which blocks the `Skill` tool unless `~/.claude/skills/gstack/bin` exists.
You don't need to pre-check; if the hook denies, surface its install
instructions to the user verbatim and stop.

Do not bypass the hook, edit `check-gstack.sh`, or work around a denial by
shelling out to gstack scripts directly. A denial means the user must install
gstack and restart — nothing else unblocks work that requires a gstack skill.

Non-`Skill` work (Read, Edit, Bash, Write, etc.) is NOT gated and proceeds
normally even without gstack.

## Web browsing

Use gstack's `/browse` skill for web browsing. It takes precedence over
built-in `WebFetch`/`WebSearch` and over the `firecrawl` skill. Only fall
back to `WebFetch`/`WebSearch` if `/browse` is unavailable (i.e., gstack
not installed) and the user has approved proceeding without it.

## Skill routing

When a user request clearly matches one of the skills below, invoke it via
the `Skill` tool. Exception: for exploratory questions ("what could we do
about X?", "how should we approach Y?"), answer in 2–3 sentences first and
only invoke a skill once the user picks a direction.

If two rules below could apply, pick the more specific one; if still
ambiguous, ask the user before invoking.

Routing table:
- Product ideas / brainstorming → `/office-hours`
- Strategy or scope review → `/plan-ceo-review`
- Architecture review → `/plan-eng-review`
- Design review of a written plan → `/plan-design-review`
   <!-- TODO: clarify when `/design-consultation` should be used instead -->
- Run the full plan-review pipeline (CEO + eng + design) → `/autoplan`
- Bugs, errors, unexpected behavior → `/investigate`
- QA / testing site behavior → `/qa` for full runs, `/qa-only` to skip fixes
- Code review of a diff or PR → `/review` (the gstack one; prefer it over
  any same-named built-in)
- Visual polish on a rendered UI → `/design-review`
- Ship / deploy / open a PR → `/ship`
   <!-- TODO: clarify when `/land-and-deploy` should be used instead -->
- Save session progress → `/context-save`
- Resume prior session context → `/context-restore`

Paths: gstack skills live under `~/.claude/skills/gstack/...` (global), not
in this repo.
