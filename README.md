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

## Agents

This repo also vendors **The Agency** — 233 specialized Claude Code subagents
organized into 16 divisions. Each agent is a standalone `.md` file with YAML
frontmatter, so Claude Code discovers it once it's in your agents directory.

Install all of them into Claude Code:

```bash
# Install every agent into ~/.claude/agents/
./scripts/install.sh --tool claude-code

# Or install only specific divisions
./scripts/install.sh --tool claude-code --division engineering,security

# Or install specific agents by slug (the file name without .md)
./scripts/install.sh --tool claude-code --agent engineering-frontend-developer,design-ui-designer

# Preview without writing, or symlink so updates propagate
./scripts/install.sh --dry-run
./scripts/install.sh --link

# Discover what's available
./scripts/install.sh --list divisions
./scripts/install.sh --list agents
```

Prefer to do it by hand? Copy a single division straight in:

```bash
cp engineering/*.md ~/.claude/agents/
```

Then activate an agent in any session — e.g. *"Use the
`engineering-frontend-developer` subagent to build a React component."*

> **Note on names:** Claude Code requires a subagent's `name` to be a
> lowercase-hyphenated slug, but the vendored agents ship Title-Case names.
> The installer rewrites `name` to the file slug on **copy**, so installed
> agents register and are invoked by their slug (e.g. `engineering-code-reviewer`).
> `--link` mode can't rewrite the source, so linked agents keep the upstream
> name. The division files in this repo are left faithful to upstream.

### Pre-installed (project-level)

A curated dev-workflow set is checked into [`.claude/agents/`](./.claude/agents),
so it's active for anyone who opens this repo — no install step:

`engineering-code-reviewer`, `engineering-minimal-change-engineer`,
`engineering-git-workflow-master`, `engineering-technical-writer`,
`engineering-prompt-engineer`, `engineering-codebase-onboarding-engineer`,
`engineering-software-architect`, `specialized-mcp-builder`,
`security-senior-secops`, `testing-reality-checker`.

Run `/agents` to see them, then invoke by slug or by intent. Add more with
`./scripts/install.sh --agent <slug> --path .claude/agents`.

### Divisions

| Division | Agents |
| :------- | -----: |
| `academic` | 5 |
| `design` | 9 |
| `engineering` | 34 |
| `finance` | 5 |
| `game-development` | 20 |
| `gis` | 13 |
| `marketing` | 36 |
| `paid-media` | 7 |
| `product` | 5 |
| `project-management` | 7 |
| `sales` | 9 |
| `security` | 10 |
| `spatial-computing` | 6 |
| `specialized` | 53 |
| `support` | 6 |
| `testing` | 8 |

### Attribution

The agents are ported from
[`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents),
licensed under the MIT License (© 2025 AgentLand Contributors). The upstream
license text is preserved verbatim in
[`LICENSE.agency-agents`](./LICENSE.agency-agents). The installer here
(`scripts/install.sh`) is a self-contained adaptation focused on Claude Code.

## gstack

This repo also requires gstack for AI-assisted work — see [CLAUDE.md](./CLAUDE.md).
The `gstack-guard` plugin packages that requirement so it can be shared with other
teams and repos via the marketplace.
