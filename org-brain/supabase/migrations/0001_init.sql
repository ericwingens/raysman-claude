-- Org Brain schema: typed knowledge graph + pgvector embeddings.
-- Run against a Supabase (Postgres) project. Prefer an EU region for GDPR/BDSG.

create extension if not exists vector;

-- ── Nodes ──────────────────────────────────────────────────────────────────
create table if not exists public.nodes (
  id                text primary key,
  type              text not null check (
                      type in ('person','subagent','tool','workflow','sop','project','team','department')
                    ),
  name              text not null,
  department        text,
  business_function text check (business_function in ('core','enabling')),
  content           text not null default '',
  props             jsonb not null default '{}'::jsonb,
  embedding         vector(1024),
  created_at        timestamptz not null default now()
);

create index if not exists nodes_type_idx on public.nodes (type);
create index if not exists nodes_department_idx on public.nodes (department);

-- HNSW index for fast cosine similarity search over embeddings.
create index if not exists nodes_embedding_idx
  on public.nodes using hnsw (embedding vector_cosine_ops);

-- ── Edges ──────────────────────────────────────────────────────────────────
create table if not exists public.edges (
  id        text primary key,
  source    text not null references public.nodes(id) on delete cascade,
  target    text not null references public.nodes(id) on delete cascade,
  rel_type  text not null,
  props     jsonb not null default '{}'::jsonb
);

create index if not exists edges_source_idx on public.edges (source);
create index if not exists edges_target_idx on public.edges (target);

-- ── Chat messages (persist copilot history) ─────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  role        text not null check (role in ('user','assistant','system')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists messages_session_idx on public.messages (session_id, created_at);

-- ── Similarity search function (cosine) ─────────────────────────────────────
create or replace function public.match_nodes(
  query_embedding vector(1024),
  match_count int default 8
)
returns table (
  id text,
  type text,
  name text,
  department text,
  business_function text,
  content text,
  props jsonb,
  similarity float
)
language sql stable
as $$
  select
    n.id,
    n.type,
    n.name,
    n.department,
    n.business_function,
    n.content,
    n.props,
    1 - (n.embedding <=> query_embedding) as similarity
  from public.nodes n
  where n.embedding is not null
  order by n.embedding <=> query_embedding
  limit match_count;
$$;

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Enable RLS; the server uses the service-role key (bypasses RLS). Add policies
-- before exposing the anon key to real users.
alter table public.nodes    enable row level security;
alter table public.edges    enable row level security;
alter table public.messages enable row level security;

-- Read-only policy for authenticated users (tighten for production / multi-tenant).
do $$ begin
  create policy "nodes_read" on public.nodes for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "edges_read" on public.edges for select to authenticated using (true);
exception when duplicate_object then null; end $$;
