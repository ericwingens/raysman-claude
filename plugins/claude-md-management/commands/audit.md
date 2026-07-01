---
description: Audit every CLAUDE.md in the repo for size, structure, duplication, and staleness.
argument-hint: "[optional path to scope the audit]"
---

Audit the `CLAUDE.md` files in this repository (scope to **$ARGUMENTS** if
provided, otherwise the whole repo).

Steps:

1. Find every `CLAUDE.md` (and `CLAUDE.local.md`) in scope. Report the line and
   character count of each.
2. For each file, evaluate:
   - **Size** — flag any file over the threshold (250 lines, or
     `CLAUDE_MD_MAX_LINES` if set). Oversized memory burns context every session.
   - **Structure** — is it scannable (clear headings, short sections) or a wall
     of prose?
   - **Duplication** — repeated instructions across nested `CLAUDE.md` files, or
     content that duplicates the README / docs.
   - **Staleness** — commands, paths, or references that no longer match the
     codebase. Verify a sample against the actual tree.
   - **Signal** — instructions Claude could trivially discover on its own, or
     vague guidance that doesn't change behavior.
3. Produce a findings report: a per-file summary plus a prioritized list of
   concrete fixes (what to cut, merge, or update).
4. Do **not** edit files in this command — recommend
   `/claude-md-management:optimize <file>` to apply the trimming.

Use the `claude-md-authoring` skill as the rubric for what "good" looks like.
