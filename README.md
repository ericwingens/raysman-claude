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

Install a plugin:

```shell
/plugin install gstack-guard@raysman-claude
```

## Validate

```bash
claude plugin validate .                       # validates marketplace.json
claude plugin validate ./plugins/gstack-guard  # validates the plugin
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

## gstack

This repo also requires gstack for AI-assisted work — see [CLAUDE.md](./CLAUDE.md).
The `gstack-guard` plugin packages that requirement so it can be shared with other
teams and repos via the marketplace.
