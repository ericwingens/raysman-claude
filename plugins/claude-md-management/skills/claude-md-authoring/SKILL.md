---
name: claude-md-authoring
description: Best-practice reference for writing and maintaining CLAUDE.md memory files. Use when creating, auditing, or trimming a CLAUDE.md, deciding what belongs in project memory, or when a CLAUDE.md has grown too large.
---

# Authoring CLAUDE.md

`CLAUDE.md` is loaded into context at the start of every session in its
directory subtree. Everything in it costs tokens on every turn, so treat it as
a curated set of high-signal instructions — not a wiki.

## What belongs in CLAUDE.md

- **Verified commands** — build, test, lint, run, deploy. Only commands you have
  confirmed work.
- **Architecture a newcomer must know** — the handful of non-obvious facts about
  how the code is organized.
- **Conventions and gotchas** — naming rules, patterns to follow, traps to
  avoid. The non-obvious "we always do X here."
- **Guardrails** — things Claude must or must not do in this repo.

## What does NOT belong

- Anything Claude can trivially discover (that a `package.json` means Node, the
  full directory listing, obvious file purposes).
- Restated defaults and generic best practices.
- Long prose, tutorials, or background essays — link out instead.
- Content duplicated from the README or docs, or from a parent `CLAUDE.md`.
- Stale commands or paths. A wrong instruction is worse than none.

## Style rules

- Prefer short, imperative, specific instructions over prose.
- Use clear headings and short sections so it stays scannable.
- One idea per bullet. Cut adjectives that don't change behavior.
- Keep it tight — aim well under **250 lines** (the size the plugin's hook
  warns at; override with `CLAUDE_MD_MAX_LINES`). Big memory files bury the
  rules that matter.

## Nested CLAUDE.md files

- A subdirectory `CLAUDE.md` loads only when working in that subtree. Push
  area-specific rules down into the relevant subdirectory rather than bloating
  the root file.
- Do not repeat parent instructions in a child file — child memory is additive.

## Maintenance loop

1. `/claude-md-management:audit` — find oversized, stale, or duplicated memory.
2. `/claude-md-management:optimize <file>` — trim a specific file to high signal.
3. `/claude-md-management:init [dir]` — scaffold memory for a new area.

When trimming, never drop a load-bearing rule just to hit a line count. Cut
noise, keep signal.
