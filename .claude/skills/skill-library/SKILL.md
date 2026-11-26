---
name: skill-library
description: Router to the ECC LIBRARY (282 skills, 67 agents, 93 commands, language rules) parked in .claude/ecc/library/ so they do not load every session. Use when a task needs a stack, domain, or workflow not covered by the always-loaded skills (e.g. Python/TS/Go/Rust patterns, TDD, deployment, databases, deep research, investor materials, video, homelab, healthcare, supply chain), or when the user asks for an ECC skill by name that is not in .claude/skills/.
---

# ECC Skill Library (router)

This repo uses an agent-sort split (see `.claude/ecc/agent-sort-plan.md`):

- **DAILY**: loaded every session from `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `.claude/rules/ecc/common/`.
- **LIBRARY**: kept in `.claude/ecc/library/`, not auto-loaded. Read on demand.

## How to use a LIBRARY item

1. Find it: `ls .claude/ecc/library/skills | grep <keyword>` (or `agents/`, `commands/`, `rules/`).
2. Read `.claude/ecc/library/skills/<name>/SKILL.md` and follow it for the current task.
3. If it will be needed regularly, promote it: `git mv .claude/ecc/library/skills/<name> .claude/skills/` and add a line to the plan file.

Do not copy skill bodies into this router.

## Keyword groups -> library paths

| Keywords | Look in `skills/` for |
| :-- | :-- |
| python, django, fastapi, pytorch | `python-*`, `django-*`, `fastapi-patterns`, `pytorch-patterns` |
| typescript, react, next, vue, angular, nuxt, vite, bun, nest | `react-*`, `nextjs-turbopack`, `vue-patterns`, `angular-developer`, `nuxt4-patterns`, `vite-patterns`, `bun-runtime`, `nestjs-patterns`, `frontend-*` |
| go, rust, kotlin, java, spring, quarkus, swift, dart, flutter, cpp, csharp, perl, laravel, rails | `<lang>-patterns`, `<lang>-testing`, `springboot-*`, `quarkus-*`, `swift*`, `dart-flutter-patterns`, `laravel-*`, `rails-patterns` |
| database, postgres, mysql, redis, clickhouse, prisma, migrations | `postgres-patterns`, `mysql-patterns`, `redis-patterns`, `clickhouse-io`, `prisma-patterns`, `database-migrations` |
| testing, tdd, e2e, verification, quality gate | `tdd-workflow`, `e2e-testing`, `verification-loop`, `browser-qa`, `ai-regression-testing` |
| deploy, docker, kubernetes, ci | `deployment-patterns`, `docker-patterns`, `kubernetes-patterns`, `canary-watch` |
| agents, loops, orchestration, harness, evals | `agentic-*`, `autonomous-*`, `continuous-*`, `orch-*`, `eval-harness`, `agent-eval`, `team-agent-orchestration` |
| research, papers, pubmed, patents, search | `deep-research`, `research-ops`, `search-first`, `exa-search`, `scientific-*`, `market-research` |
| business, investors, pricing, competitors, contracts | `investor-materials`, `investor-outreach`, `competitive-*`, `benchmark-methodology`, `product-lens`, `master-agreement-generator` |
| content, social, x, crosspost, articles | `article-writing`, `crosspost`, `social-publisher`, `x-api`, `connections-optimizer`, `brand-discovery` |
| video, motion, manim, remotion, media gen | `video-editing`, `remotion-video-creation`, `motion-*`, `manim-video`, `fal-ai-media`, `videodb` |
| crypto, defi, prediction markets | `defi-amm-security`, `evm-token-decimals`, `prediction-market-*`, `llm-trading-agent-security`, `agent-payment-x402` |
| security, compliance, hipaa | `security-review`, `security-bounty-hunter`, `hipaa-compliance`, `healthcare-*`, `safety-guard`, `gateguard` |
| network, homelab, cisco | `homelab-*`, `network-*`, `cisco-ios-patterns`, `netmiko-ssh-automation` |
| supply chain, logistics, energy | `carrier-relationship-management`, `customs-trade-compliance`, `energy-procurement`, `inventory-demand-planning`, `logistics-exception-management`, `production-scheduling` |
| config hygiene, skills audit | `skill-comply`, `skill-scout`, `config-gc`, `rules-distill`, `automation-audit-ops`, `hookify-rules` |

Agents: `.claude/ecc/library/agents/` (language reviewers/build-resolvers, planner, tdd-guide, security-reviewer, opensource-*, network-*).
Commands: `.claude/ecc/library/commands/` (read the .md and execute its steps manually).
Rules: `.claude/ecc/library/rules/<lang>/` (path-scoped language rules) and `rules/common/` (coding-style, testing, git-workflow, etc.).
Non-Claude harness extras (Codex skills, Pi, AGENTS.md): `.claude/ecc/library/extras/`.
