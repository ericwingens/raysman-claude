---
description: Trim and refactor an existing CLAUDE.md into a concise, high-signal file.
argument-hint: "[path to CLAUDE.md, defaults to ./CLAUDE.md]"
---

Optimize the `CLAUDE.md` at **$ARGUMENTS** (default `./CLAUDE.md`).

Steps:

1. Read the file. If it does not exist, STOP and suggest
   `/claude-md-management:init`.
2. Refactor it to be lean and high-signal, preserving every instruction that
   genuinely changes Claude's behavior:
   - **Cut** filler, restated defaults, and anything Claude can discover on its
     own (e.g. "this is a Node project" when `package.json` is right there).
   - **Merge** duplicated or overlapping guidance.
   - **Verify** commands, paths, and references against the current codebase;
     fix or remove anything stale.
   - **Restructure** into short, scannable sections with clear headings.
   - **Sharpen** vague prose into specific, imperative instructions.
3. Never drop a real, load-bearing rule just to hit a line count. If cutting
   would lose signal, keep it and explain the trade-off.
4. Show the user a short before/after summary: old vs new line count and the key
   changes you made.

Use the `claude-md-authoring` skill as the rubric.
