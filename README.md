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

| Server | Transport | Endpoint / command |
| :----- | :-------- | :----------------- |
| `moda` | HTTP | `https://mcp.moda.app/mcp` |
| `mcp-server-for-revit` | stdio | `cmd /c npx -y mcp-server-for-revit` |

Project MCP servers require a one-time approval per user before Claude Code
activates them — run `claude` and approve when prompted, or `claude mcp list` to
check status. Add another server with:

```shell
claude mcp add --transport http --scope project <name> <url>   # HTTP
claude mcp add --scope project <name> -- <command> [args...]   # stdio
```

### `mcp-server-for-revit` (Windows only)

Drives Autodesk Revit over the [`mcp-server-for-revit`](https://www.npmjs.com/package/mcp-server-for-revit)
npm package. Revit is Windows-only, so this server only starts on a Windows host:

- The `cmd /c` wrapper is the standard Windows workaround — Claude Code cannot
  spawn the `npx` shim directly there.
- On Linux/macOS (including Claude Code on the web containers) there is no `cmd`,
  so the server fails to start and its tools are unavailable. That is expected;
  ignore the connection error, or skip approving this server on those hosts.
- It also needs the companion Revit add-in installed and Revit running, otherwise
  the server starts but has nothing to talk to.

It was added with:

```shell
claude mcp add --scope project mcp-server-for-revit -- cmd /c npx -y mcp-server-for-revit
```

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
