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

## gstack

This repo also requires gstack for AI-assisted work — see [CLAUDE.md](./CLAUDE.md).
The `gstack-guard` plugin packages that requirement so it can be shared with other
teams and repos via the marketplace.
