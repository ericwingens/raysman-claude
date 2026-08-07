# raysman-claude

A Claude Code workspace that is also a **plugin marketplace**.

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
- **Claude Code on the web:** point your *environment setup script* at
  `scripts/install-council-global.sh` so every fresh container installs the
  council globally on startup.

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
