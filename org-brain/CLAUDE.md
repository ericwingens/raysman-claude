# Org Brain — project spec & conventions (for AI-assisted work)

Self-hosted **Next.js 15 (App Router, TypeScript, Tailwind)** app: an
Obsidian-style typed org knowledge graph + an `@`-mention RAG copilot.

## Stack
- **Frontend:** Next.js 15, React 19, Tailwind 3, lucide-react icons.
- **Graph:** `react-force-graph-2d` (dynamic import, SSR disabled).
- **Editor:** TipTap + `@tiptap/extension-mention` for `@`-mentions.
- **Chat/stream:** Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`).
- **LLM:** Anthropic Messages API. Default `claude-sonnet-4-6`; planning
  `claude-opus-4-8`. Always pin versioned model strings — never alias strings.
- **Backend:** Supabase (Postgres + pgvector). `match_nodes()` for cosine search.
- **Embeddings:** Voyage AI (`voyage-4`, 1024 dims). Anthropic ships no embedder.

## Data model
`nodes(id, type∈{person,subagent,tool,workflow,sop,project,team,department}, name,
department, business_function∈{core,enabling}, content, props jsonb, embedding
vector(1024))`, `edges(id, source, target, rel_type)`, `messages(...)`.

## Routes
- `/ai-brains/org` — force graph (filter panel, cluster by business_function,
  click → detail drawer).
- `/copilot-employee` — `@`-mention chat with RAG injection.
- `/api/search` — hybrid (vector/keyword) node search → powers `@` menu.
- `/api/nodes` — full graph for the visualization.
- `/api/chat` — resolves mentions → fetches node content → injects as
  `<document>` XML → streams from Claude (with Asana/Apollo tools).

## Conventions
- Server-only Supabase access via the service-role key (`src/lib/supabase/server.ts`);
  never import it into client components.
- Everything degrades gracefully: with no env keys the app runs on
  `src/data/seed.json` and the copilot returns a deterministic offline answer.
- Validate API input with zod.
- Retrieved docs wrapped per Anthropic guidance: `<document><source>…</source>
  <document_content>…</document_content></document>`.
- After changes run `npm run typecheck` and `npm run lint`.

## GDPR / BDSG
People are **pseudonymous** (role titles, not names). Storing employee data is
personal-data processing under GDPR + the German BDSG: document a lawful basis,
keep a ROPA, sign DPAs with every sub-processor (Anthropic, Voyage, Supabase,
Vercel), and prefer EU-region hosting before processing real data. Not legal advice.
