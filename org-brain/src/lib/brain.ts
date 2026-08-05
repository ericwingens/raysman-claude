import "server-only";
import seed from "@/data/seed.json";
import { getServiceClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embeddings";
import { cosineSimilarity } from "@/lib/utils";
import type { GraphEdge, GraphNode, OrgBrain } from "@/lib/types";

// The bundled seed doubles as the offline data source AND the local search
// corpus. Local embeddings are not precomputed, so the offline path uses a
// lightweight keyword score; the Supabase path uses pgvector via match_nodes().
const localBrain = seed as unknown as OrgBrain;

export interface SearchHit extends GraphNode {
  score: number;
}

/** Whole graph for the visualization. */
export async function getGraph(): Promise<OrgBrain> {
  const supabase = getServiceClient();
  if (!supabase) return localBrain;

  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from("nodes").select("id,type,name,department,business_function,content,props"),
    supabase.from("edges").select("id,source,target,rel_type,props"),
  ]);

  if (nodesRes.error) throw new Error(nodesRes.error.message);
  if (edgesRes.error) throw new Error(edgesRes.error.message);

  return {
    nodes: (nodesRes.data ?? []) as GraphNode[],
    edges: (edgesRes.data ?? []) as GraphEdge[],
  };
}

/** Resolve a set of node ids to their full records (for @-mention RAG). */
export async function getNodesByIds(ids: string[]): Promise<GraphNode[]> {
  if (ids.length === 0) return [];
  const supabase = getServiceClient();
  if (!supabase) {
    const set = new Set(ids);
    return localBrain.nodes.filter((n) => set.has(n.id));
  }
  const { data, error } = await supabase
    .from("nodes")
    .select("id,type,name,department,business_function,content,props")
    .in("id", ids);
  if (error) throw new Error(error.message);
  return (data ?? []) as GraphNode[];
}

/**
 * Hybrid search over nodes for the @-mention menu and free-text RAG.
 * Uses pgvector (match_nodes) when Supabase + Voyage are configured, and a
 * keyword scorer otherwise. Always returns ranked, capped results.
 */
export async function searchNodes(query: string, limit = 8): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = getServiceClient();

  if (supabase) {
    const embedding = await embedOne(trimmed, { inputType: "query" });
    if (embedding) {
      const { data, error } = await supabase.rpc("match_nodes", {
        query_embedding: embedding,
        match_count: limit,
      });
      if (error) throw new Error(error.message);
      return ((data ?? []) as (GraphNode & { similarity: number })[]).map((n) => ({
        ...n,
        score: n.similarity,
      }));
    }
    // Supabase but no embeddings → fall back to Postgres text search.
    const { data, error } = await supabase
      .from("nodes")
      .select("id,type,name,department,business_function,content,props")
      .or(`name.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
      .limit(limit);
    if (error) throw new Error(error.message);
    return ((data ?? []) as GraphNode[]).map((n) => ({ ...n, score: 0.5 }));
  }

  // Fully offline: keyword scoring over the local seed.
  return keywordSearch(trimmed, limit);
}

function keywordSearch(query: string, limit: number): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = localBrain.nodes.map((n) => {
    const haystack = `${n.name} ${n.type} ${n.content} ${JSON.stringify(n.props)}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (n.name.toLowerCase().includes(t)) score += 3;
      else if (haystack.includes(t)) score += 1;
    }
    return { ...n, score };
  });
  return scored
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Re-exported helper so non-Supabase contexts can still rank by a precomputed
// embedding (used by tests / scripts).
export function rankByEmbedding(
  queryEmbedding: number[],
  candidates: (GraphNode & { embedding: number[] })[],
  limit: number,
): SearchHit[] {
  return candidates
    .map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
