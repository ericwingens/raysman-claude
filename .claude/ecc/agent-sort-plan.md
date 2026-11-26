# ECC agent-sort plan (raysman-claude)

Date: 2026-11-26. Source install: `ecc-universal` 2.2.3, `--target claude-project --profile full --no-hooks`.

## STACK (repo evidence)

- Claude Code workspace + plugin marketplace: `.claude-plugin/marketplace.json`, `plugins/gstack-guard`, `plugins/video-vision`.
- Content is mostly Markdown skills (117 .md outside `.claude/`), JSON manifests (17), Bash (10).
- No application code, no package manifest (`package.json`, `pyproject.toml` absent), no test suite, no CI.
- The .py/.ts/.tsx files live inside vendored skills (`.agents/skills/notebooklm`, `remotion-to-hyperframes` test corpus), not in a project build.
- Existing workflows: gstack (global, enforced by `.claude/hooks/check-gstack.sh`), 13 LinkedIn `li-*` skills, hyperframes/gsap/remotion video skills, research skills (agent-reach, firecrawl, notebooklm), `council`, project MCP (`.mcp.json`).

## DAILY (auto-loaded)

| Component | Type | Evidence |
| :-- | :-- | :-- |
| agent-sort, configure-ecc, ecc-guide | skill | `.claude/ecc/install-state.json` present; ECC install must be maintained |
| skill-stocktake, context-budget, workspace-surface-audit | skill | 43 skills + 290 pre-existing agents in `.claude/`; overlap/context load is the repo's core maintenance problem |
| mcp-server-patterns | skill | `.mcp.json` with project MCP server |
| security-scan | skill | repo is a Claude config surface (hooks, settings, MCP) published as marketplace |
| content-engine, brand-voice | skill | 13 `li-*` LinkedIn skills, postzen license file |
| skill-library | skill (router) | entry point to LIBRARY |
| harness-optimizer | agent | harness/config repo |
| harness-audit | command | backed by `.claude/scripts/harness-audit.js` (tested, runs) |
| rules/ecc/common/security.md, hooks.md | rule | repo ships hooks (`.claude/hooks/`, `plugins/gstack-guard`) and must not leak secrets |

## LIBRARY (`.claude/ecc/library/`, not auto-loaded)

- 282 skills: off-stack languages/frameworks, DB, testing, deployment, domain packs (healthcare, supply chain, crypto, homelab, ML). Overlaps with existing skills also parked here: `deep-research`, `security-review`, `design-system`, `canary-watch`, `benchmark`, `remotion-video-creation`, `video-editing`, `motion-*` (gstack / hyperframes / plugins already cover them).
- 67 agents (language reviewers, build resolvers, planner, tdd-guide, etc.): no matching source code.
- 93 commands (incl. `skill-health`: broken in ECC 2.2.3, `scripts/lib/skill-evolution/health` missing) (language build/test/review, orch-*, prp-*, epic-*, multi-*): no matching stack or replaced by gstack.
- Rules: all 23 language rule sets + common/{agents,code-review,coding-style,development-workflow,git-workflow,patterns,performance,testing}.md. Reasons: no tests (testing.md demands 80% coverage), agents.md routes to agents now in LIBRARY, git-workflow.md conflicts with session branch/attribution rules.
- Extras: `.agents` (Codex), `.pi`, `AGENTS.md`: not read by Claude Code.

## Not changed

- All 33 pre-existing skills, ~290 pre-existing agents, `.claude/hooks/`, `.claude/settings.json`, `.claude/scripts/`, `.claude/mcp-configs/`.

## Caveat

`.claude/ecc/install-state.json` still lists the full install. Re-running `ecc install` / `configure-ecc` (or ECC auto-update) will restore files into the auto-loaded paths. Re-apply this plan afterwards, or reinstall with explicit `--modules`.
