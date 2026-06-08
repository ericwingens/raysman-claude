# Org Brain

An **Obsidian-style, typed organisation knowledge graph** with an
**`@`-mention RAG copilot** powered by Claude. It reproduces the
"org-brain + copilot" experience: a radial force graph of people, AI
sub-agents, tools, SOPs and workflows, plus a chat where you type `@` to
mention a node and inject its content as retrieval context.

> This is **Path 1 (full custom)** from the build brief. It runs out-of-the-box
> on bundled seed data, and switches to a real Supabase + Voyage + Claude
> backend when you add API keys.

## Features

- **`/ai-brains/org`** — `react-force-graph-2d` graph. Fill colour = department,
  ring colour = node type, core/enabling functions cluster left/right. Filter
  panel toggles node types; click any node for a detail drawer with its
  connections.
- **`/copilot-employee`** — TipTap editor with `@`-mention autocomplete (async,
  hits `/api/search`). Mentions become structured `{id, type, label}` chips that
  resolve to node content server-side and get injected as `<document>` XML into
  Claude's system prompt. Streaming answers via the Vercel AI SDK.
- **Agent tools** — the copilot can call **Asana** (create task) and
  **Apollo.io** (people search) when their keys are set (dry-run otherwise).
- **Graceful degradation** — no keys? The app serves `src/data/seed.json` and
  the copilot returns the retrieved context directly, so the UX is demoable
  with zero setup.

## Quick start (zero-config demo)

```bash
cd org-brain
npm install
npm run dev      # → http://localhost:3000
```

Open the **Org Graph** and the **Copilot**. Everything works on local seed data.

## Production backend (Supabase + Voyage + Claude)

1. Copy env and fill in keys:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`.
2. Run the schema migration in the Supabase SQL editor:
   `supabase/migrations/0001_init.sql` (creates `nodes`, `edges`, `messages`,
   the pgvector HNSW index, and the `match_nodes()` cosine function).
3. Embed + load the seed brain into Supabase:
   ```bash
   npm run ingest
   ```
4. `npm run dev` — the app now reads from Supabase, searches via pgvector, and
   the copilot answers with Claude (`claude-sonnet-4-6` by default).

### Regenerate / customize the brain content

```bash
npx tsx scripts/generate-seed.ts   # rebuilds src/data/seed.json
```

Edit `scripts/generate-seed.ts` (departments, teams, agents, tools, SOPs,
workflows) to model your own org, then re-run `npm run ingest`.

## Architecture

```
Next.js (App Router, TS, Tailwind)
├─ /ai-brains/org      → react-force-graph-2d (dynamic, SSR off)
├─ /copilot-employee   → TipTap @-mention editor + AI SDK useChat
├─ /api/search         → hybrid vector/keyword node search (mention menu)
├─ /api/nodes          → full graph for the visualization
├─ /api/chat           → resolve mentions → fetch node content →
│                         inject <document> XML → streamText(Claude) + tools
└─ Supabase (Postgres + pgvector)
     nodes / edges / messages + match_nodes() cosine function
   Embeddings: Voyage AI (voyage-4, 1024d) at ingest + query time
```

## Models

Pinned, versioned strings (configurable in `.env`):

- `ANTHROPIC_MODEL=claude-sonnet-4-6` — copilot (speed/intelligence balance).
- `ANTHROPIC_PLANNING_MODEL=claude-opus-4-8` — heavier planning/generation.

## GDPR / BDSG (read before using real data)

Storing people/teams/roles is **personal-data processing** under GDPR and the
German **BDSG**. This app keeps person nodes **pseudonymous** (role titles, not
names) by default. Before processing real employee data:

- Document a **lawful basis** (consent is weak in employment; lean on Art. 6(1)(b)/(f)
  GDPR + BDSG necessity, and a documented balancing test).
- Keep a **Record of Processing Activities (ROPA)** and sign **DPAs** with every
  sub-processor (Anthropic, Voyage AI, Supabase, Vercel).
- Prefer **EU-region** hosting; do a third-country transfer assessment (SCCs) for
  US-based LLM/embedding APIs. Consider pseudonymizing before embedding.

This is general information, **not legal advice** — consult a German DPO/lawyer.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js ESLint |
| `npm run ingest` | Embed seed + upsert into Supabase |
| `npx tsx scripts/generate-seed.ts` | Regenerate `src/data/seed.json` |
```
