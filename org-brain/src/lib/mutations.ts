import "server-only";
import seed from "@/data/seed.json";
import { getServiceClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embeddings";
import { env } from "@/lib/env";
import type { GraphNode, GraphEdge, NodeType, RelType, OrgBrain } from "@/lib/types";

const localBrain = seed as unknown as OrgBrain;

export class NotConfiguredError extends Error {
  constructor() {
    super("Editing requires Supabase to be configured.");
    this.name = "NotConfiguredError";
  }
}

function client() {
  const c = getServiceClient();
  if (!c) throw new NotConfiguredError();
  return c;
}

/** Verify the optional write token. No-op when ORG_BRAIN_EDIT_TOKEN is unset. */
export function assertAuthorized(token: string | null) {
  if (env.editToken && token !== env.editToken) {
    const err = new Error("Unauthorized");
    err.name = "UnauthorizedError";
    throw err;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

const ID_PREFIX: Record<NodeType, string> = {
  person: "p",
  subagent: "a",
  tool: "t",
  workflow: "wf",
  sop: "sop",
  project: "prj",
  team: "team",
  department: "dept",
};

async function uniqueId(type: NodeType, name: string): Promise<string> {
  const supabase = client();
  const base = `${ID_PREFIX[type]}_${slugify(name) || "node"}`;
  let candidate = base;
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase.from("nodes").select("id").eq("id", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}_${i}`;
  }
  return `${base}_${Date.now().toString(36)}`;
}

async function embedContent(content: string): Promise<number[] | null> {
  if (!content.trim()) return null;
  try {
    return await embedOne(content, { inputType: "document" });
  } catch {
    return null; // Don't block a save on an embedding hiccup.
  }
}

export interface NodeInput {
  id?: string;
  type: NodeType;
  name: string;
  department?: string | null;
  business_function?: "core" | "enabling" | null;
  content?: string;
  props?: Record<string, unknown>;
}

export async function createNode(input: NodeInput): Promise<GraphNode> {
  const supabase = client();
  const id = input.id?.trim() || (await uniqueId(input.type, input.name));
  const content = input.content ?? "";
  const row = {
    id,
    type: input.type,
    name: input.name,
    department: input.department ?? null,
    business_function: input.business_function ?? null,
    content,
    props: input.props ?? {},
    embedding: await embedContent(content),
  };
  const { error } = await supabase.from("nodes").insert(row);
  if (error) throw new Error(error.message);
  return row as GraphNode;
}

export async function updateNode(
  id: string,
  patch: Partial<NodeInput>,
): Promise<GraphNode> {
  const supabase = client();
  const { data: existing, error: readErr } = await supabase
    .from("nodes")
    .select("id,type,name,department,business_function,content,props")
    .eq("id", id)
    .single();
  if (readErr) throw new Error(readErr.message);

  const merged = {
    type: patch.type ?? existing.type,
    name: patch.name ?? existing.name,
    department: patch.department !== undefined ? patch.department : existing.department,
    business_function:
      patch.business_function !== undefined ? patch.business_function : existing.business_function,
    content: patch.content !== undefined ? patch.content : existing.content,
    props: patch.props ?? existing.props,
  };

  const contentChanged = patch.content !== undefined && patch.content !== existing.content;
  const update: Record<string, unknown> = { ...merged };
  if (contentChanged) update.embedding = await embedContent(merged.content);

  const { data, error } = await supabase
    .from("nodes")
    .update(update)
    .eq("id", id)
    .select("id,type,name,department,business_function,content,props")
    .single();
  if (error) throw new Error(error.message);
  return data as GraphNode;
}

export async function deleteNode(id: string): Promise<void> {
  const supabase = client();
  // Edges referencing this node cascade-delete via the FK constraint.
  const { error } = await supabase.from("nodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createEdge(
  source: string,
  target: string,
  rel_type: RelType,
): Promise<GraphEdge> {
  const supabase = client();
  const id = `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const row = { id, source, target, rel_type, props: {} };
  const { error } = await supabase.from("edges").insert(row);
  if (error) throw new Error(error.message);
  return row as GraphEdge;
}

export async function deleteEdge(id: string): Promise<void> {
  const supabase = client();
  const { error } = await supabase.from("edges").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Idempotently load the bundled seed into Supabase. Safe to call repeatedly
 * (upsert on id). Runs on the server (e.g. Netlify), so no local ingest needed.
 */
export async function seedFromLocal(): Promise<{ nodes: number; edges: number }> {
  const supabase = client();
  const BATCH = 32;
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < localBrain.nodes.length; i += BATCH) {
    const chunk = localBrain.nodes.slice(i, i + BATCH);
    const embeddings = await Promise.all(chunk.map((n) => embedContent(n.content || n.name)));
    chunk.forEach((n, j) => {
      rows.push({
        id: n.id,
        type: n.type,
        name: n.name,
        department: n.department,
        business_function: n.business_function,
        content: n.content,
        props: n.props,
        embedding: embeddings[j],
      });
    });
  }
  const { error: nErr } = await supabase.from("nodes").upsert(rows, { onConflict: "id" });
  if (nErr) throw new Error(nErr.message);
  const { error: eErr } = await supabase
    .from("edges")
    .upsert(localBrain.edges, { onConflict: "id" });
  if (eErr) throw new Error(eErr.message);
  return { nodes: rows.length, edges: localBrain.edges.length };
}

export async function countNodes(): Promise<number> {
  const supabase = client();
  const { count, error } = await supabase
    .from("nodes")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
