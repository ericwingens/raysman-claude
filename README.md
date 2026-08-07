# raysman-claude

A Claude Code workspace that is also a **plugin marketplace**.

## Environment setup

Project-level config (`.claude/`, `.mcp.json`) is restored automatically in every
fresh web container. Anything that lives in `$HOME` is **not** — gstack and the
global council have to be reinstalled each time. `scripts/setup-claude-code.sh`
does that in one shot:

```bash
scripts/setup-claude-code.sh                  # full bootstrap
scripts/setup-claude-code.sh --skip-gstack    # or skip individual steps
scripts/setup-claude-code.sh --help
```

It clones gstack and runs `./setup --team`, installs the vendored council
globally, then verifies project-scoped plugins and the gstack guard, ending with
a summary of anything that needs attention.

- **Local machine:** run it once from a checkout; `~/.claude` persists.
- **Claude Code on the web:** the environment's **Setup script** field takes an
  *inline* Bash script, and an environment is not bound to one repository, so it
  cannot simply call this script by path. Paste a self-contained equivalent
  instead (see below).

### Web environment setup script

Open [claude.ai/code](https://claude.ai/code) → environment settings → **Setup
script**, and paste:

```bash
#!/bin/bash
# gstack — required by CLAUDE.md. Never fail the session: a non-zero exit
# prevents the container from starting at all.
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack || true
(cd ~/.claude/skills/gstack && timeout 240 ./setup --team) || true
```

Two constraints from the docs shape that snippet: the script **must exit zero**
(a non-zero exit fails the session), and it should **finish within ~5 minutes**
so the environment snapshot can build. The result is cached as a filesystem
snapshot and reused, so gstack lands in `$HOME` once and persists — the script
re-runs only when you edit it, when the allowed hosts change, or after ~7 days.

The council step is deliberately absent: it installs from this repo's vendored
copy, which the environment cannot assume is present. The `SessionStart` hook
below covers it instead.

### SessionStart hook (repo-tracked, cloud *and* local)

`.claude/settings.json` runs `scripts/session-start-bootstrap.sh` on every
`startup|resume`. Unlike the environment setup script it lives in the repo, needs
no web UI, and works locally too. It does nothing and prints nothing when the
environment is already good, and splits work by cost:

| | Step | Why |
| :--- | :--- | :--- |
| **sync** | install the vendored council | offline file copy, effectively instant |
| **sync** | clone gstack | this is what the `PreToolUse` gate checks — without it every skill is denied |
| **async** | `./setup --team` | installs Bun and downloads Playwright's Chromium; too slow to block a session on |

So a fresh container has a working gstack gate within seconds, while the slow
completion finishes in the background (log: `$TMPDIR/gstack-bootstrap.log`).
`/browse` and `/qa` stay unavailable until it does.

The async step is attempted **once per container**, guarded by
`~/.gstack/.hook-setup-attempted`: gstack writes `.last-setup-version` only on
success, so a sandbox that blocks the Chromium download would otherwise retry the
whole install on every single session start.

The script never runs under `set -e` and always exits 0 — a hook must not be able
to break session start.

The script is idempotent and exits 0 whenever the environment is usable. A
partial gstack setup is reported as a warning rather than a failure: gstack's own
`setup` runs under `set -e` and aborts on the Playwright Chromium download, which
a sandbox network allowlist routinely blocks. Non-browser skills still work in
that state, so the bootstrap continues instead of leaving the container half-set-up.

## Marketplace

`.claude-plugin/marketplace.json` defines the `raysman-claude` marketplace. Add it
in any Claude Code session:

```shell
/plugin marketplace add ericwingens/raysman-claude
```

### Plugins

| Plugin | Description |
| :----- | :---------- |
| [`gstack-guard`](./plugins/gstack-guard) | Blocks skill usage until gstack is installed globally, and ships gstack setup + skill-routing guidance. |
| [`video-vision`](./plugins/video-vision) | Analyze videos by sampling frames with ffmpeg so Claude can read them as images and reason about the contents. |

Install a plugin:

```shell
/plugin install gstack-guard@raysman-claude
```

## Validate

```bash
claude plugin validate .                       # validates marketplace.json
claude plugin validate ./plugins/gstack-guard  # validates the plugin
```

## MCP servers

`.mcp.json` defines project-scoped MCP servers that load in every session on this
repo (project-level config is restored on each fresh web container).

| Server | Transport | URL |
| :----- | :-------- | :-- |
| `moda` | HTTP | `https://mcp.moda.app/mcp` |

Project MCP servers require a one-time approval per user before Claude Code
activates them — run `claude` and approve when prompted, or `claude mcp list` to
check status. Add another HTTP server with:

```shell
claude mcp add --transport http --scope project <name> <url>
```

## claude-mem

[claude-mem](https://github.com/thedotmack/claude-mem) is a persistent memory
compression system for Claude Code — it captures tool observations, writes
semantic summaries at session end, and restores them at the start of the next
session so context survives across sessions and compactions.

It is installed as a **project-scoped plugin**, so `.claude/settings.json`
declares both the upstream marketplace and the enabled plugin and every fresh web
container picks it up automatically:

```json
{
  "extraKnownMarketplaces": {
    "thedotmack": { "source": { "source": "github", "repo": "thedotmack/claude-mem" } }
  },
  "enabledPlugins": { "claude-mem@thedotmack": true }
}
```

To reproduce that from scratch (or install it in another repo):

```bash
claude plugin marketplace add thedotmack/claude-mem --scope project
claude plugin install claude-mem@thedotmack --scope project
```

The plugin ships 6 lifecycle hooks (Setup, SessionStart, UserPromptSubmit,
PostToolUse, PreToolUse, Stop), an `mcp-search` MCP server, and 19 skills —
including `/mem-search` to query stored memories, `/timeline-report`,
`/standup`, and `/learn-codebase`. Its `Setup` hook installs the runtime
dependencies (Bun, bundled SQLite) on first run; Node.js 20+ is required.

Check status with `claude plugin list` or `claude plugin details claude-mem@thedotmack`.

## Council of High Intelligence

The [`/council`](https://github.com/0xNyk/council-of-high-intelligence) skill and
its 18 thinker agents are vendored into `.claude/` so they auto-load in every
session on this repo (project-level `.claude/` is restored on each fresh web
container).

### Global install (all repos / machines)

To make `/council` available everywhere — not just this repo — run the offline
installer, which copies the vendored council into a global Claude config dir:

```bash
scripts/install-council-global.sh            # installs into ~/.claude
scripts/install-council-global.sh /some/dir  # or an explicit target
```

- **Local machine:** run it once from a checkout; `~/.claude` persists.
- **Claude Code on the web:** prefer `scripts/setup-claude-code.sh` as your
  *environment setup script* — it runs this installer as one of its steps, plus
  gstack. Point it at `scripts/install-council-global.sh` only if you want the
  council and nothing else.

The installer is fully offline (no network, no external repo) — it sources
straight from this repo's `.claude/` copy.

## Agency Agents

The [Agency Agents](https://github.com/msitarzewski/agency-agents) roster (269
specialized subagents across 17 divisions — engineering, design, marketing,
security, and more) is vendored into `.claude/agents/` so the agents auto-load
in every session on this repo (project-level `.claude/` is restored on each
fresh web container).

They were installed with the upstream native Claude Code installer, which copies
the source `.md` + YAML frontmatter agents straight into the agents directory (no
conversion needed):

```bash
# from a checkout of msitarzewski/agency-agents
./scripts/install.sh --tool claude-code --path <repo>/.claude/agents
```

Activate one in a session by referencing it by name, e.g.
`"Activate the Frontend Developer and help me build a React component."`

## gstack

This repo also requires gstack for AI-assisted work — see [CLAUDE.md](./CLAUDE.md).
The `gstack-guard` plugin packages that requirement so it can be shared with other
teams and repos via the marketplace.
