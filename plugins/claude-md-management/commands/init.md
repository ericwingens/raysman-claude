---
description: Scaffold a well-structured CLAUDE.md for the current project or a subdirectory.
argument-hint: "[target directory, defaults to repo root]"
---

Create a new `CLAUDE.md` memory file for **$ARGUMENTS** (default to the repository
root if no directory is given).

Follow these steps:

1. If a `CLAUDE.md` already exists at the target path, STOP and tell the user —
   suggest `/claude-md-management:optimize` instead of overwriting it.
2. Inspect the project to ground the file in reality: read `README.md`,
   `package.json` / `pyproject.toml` / `go.mod` / equivalent, the directory
   layout, and any obvious build/test/lint commands. Do not invent commands you
   have not verified.
3. Write a concise `CLAUDE.md` with only sections that carry real signal. Good
   candidates:
   - **Project overview** — one or two sentences on what this is.
   - **Commands** — verified build, test, lint, run commands.
   - **Architecture / layout** — the handful of things a newcomer must know.
   - **Conventions** — non-obvious rules (naming, patterns, gotchas).
4. Keep it tight. Prefer imperative, specific instructions over prose. Omit
   anything Claude can trivially discover on its own. Aim well under the size
   threshold (250 lines).

Reference the `claude-md-authoring` skill for the full best-practice checklist
before writing.
