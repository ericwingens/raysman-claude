"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Database } from "lucide-react";
import { FilterPanel } from "@/components/graph/FilterPanel";
import { NodeDetailDrawer } from "@/components/graph/NodeDetailDrawer";
import { NodeEditor } from "@/components/graph/NodeEditor";
import {
  NODE_TYPES,
  type GraphNode,
  type NodeType,
  type OrgBrain,
  type RelType,
} from "@/lib/types";
import { api, ensureToken, type Capabilities, type NodeInput } from "@/lib/client-edit";

const OrgGraph = dynamic(() => import("@/components/graph/OrgGraph").then((m) => m.OrgGraph), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted">Loading graph…</div>
  ),
});

export function OrgBrainView() {
  const [brain, setBrain] = useState<OrgBrain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Set<NodeType>>(new Set(NODE_TYPES));
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const [caps, setCaps] = useState<Capabilities>({ editable: false, requiresToken: false });
  const [nodeCount, setNodeCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  const reload = useCallback(async (): Promise<OrgBrain> => {
    const data: OrgBrain = await fetch("/api/nodes").then((r) => r.json());
    setBrain(data);
    return data;
  }, []);

  useEffect(() => {
    reload().catch(() => setError("Failed to load the graph."));
    api.capabilities().then(setCaps).catch(() => {});
  }, [reload]);

  // When editing is available, learn whether the DB is empty (offer seeding).
  useEffect(() => {
    if (caps.editable) api.seedCount().then(setNodeCount).catch(() => {});
  }, [caps.editable]);

  const filtered = useMemo<OrgBrain | null>(() => {
    if (!brain) return null;
    const nodes = brain.nodes.filter((n) => active.has(n.type));
    const keep = new Set(nodes.map((n) => n.id));
    const edges = brain.edges.filter((e) => keep.has(e.source) && keep.has(e.target));
    return { nodes, edges };
  }, [brain, active]);

  const counts = useMemo(() => {
    const c = {} as Record<NodeType, number>;
    for (const t of NODE_TYPES) c[t] = 0;
    brain?.nodes.forEach((n) => {
      c[n.type] = (c[n.type] ?? 0) + 1;
    });
    return c;
  }, [brain]);

  const departments = useMemo(
    () =>
      (brain?.nodes ?? [])
        .filter((n) => n.type === "department")
        .map((n) => ({ id: n.id, name: n.name })),
    [brain],
  );

  function toggle(type: NodeType) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  // Run a mutation with token handling, busy state, and error surfacing.
  const withBusy = useCallback(
    async (fn: () => Promise<void>) => {
      if (caps.requiresToken && !ensureToken(caps)) {
        alert("An edit token is required to make changes.");
        return;
      }
      setBusy(true);
      try {
        await fn();
      } catch (e) {
        alert(`Edit failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setBusy(false);
      }
    },
    [caps],
  );

  const reselect = (data: OrgBrain, id: string | null) =>
    setSelected(id ? data.nodes.find((n) => n.id === id) ?? null : null);

  const handleCreate = (input: NodeInput) =>
    withBusy(async () => {
      const { node } = await api.createNode(input);
      const data = await reload();
      setAdding(false);
      reselect(data, node.id);
      if (caps.editable) api.seedCount().then(setNodeCount).catch(() => {});
    });

  const handleSaveEdit = (id: string, input: NodeInput) =>
    withBusy(async () => {
      await api.updateNode(id, input);
      reselect(await reload(), id);
    });

  const handleDelete = (id: string) =>
    withBusy(async () => {
      await api.deleteNode(id);
      reselect(await reload(), null);
    });

  const handleAddEdge = (source: string, target: string, rel: RelType) =>
    withBusy(async () => {
      await api.createEdge(source, target, rel);
      reselect(await reload(), source);
    });

  const handleRemoveEdge = (edgeId: string) =>
    withBusy(async () => {
      const current = selected?.id ?? null;
      await api.deleteEdge(edgeId);
      reselect(await reload(), current);
    });

  const handleLoadSeed = () =>
    withBusy(async () => {
      await api.loadSeed();
      await reload();
      api.seedCount().then(setNodeCount).catch(() => {});
    });

  return (
    <div className="flex h-full">
      <FilterPanel
        active={active}
        counts={counts}
        total={brain?.nodes.length ?? 0}
        onToggle={toggle}
        onAll={() => setActive(new Set(NODE_TYPES))}
        onNone={() => setActive(new Set())}
      />
      <div className="relative min-w-0 flex-1">
        {/* Edit toolbar */}
        {caps.editable && (
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm shadow hover:border-accent/60"
            >
              <Plus className="h-4 w-4" /> Add node
            </button>
            {nodeCount === 0 && (
              <button
                onClick={handleLoadSeed}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm shadow hover:border-accent/60 disabled:opacity-50"
              >
                <Database className="h-4 w-4" /> Load seed data
              </button>
            )}
          </div>
        )}
        {!caps.editable && (
          <div className="absolute left-3 top-3 z-10 rounded-md border border-border bg-panel/80 px-3 py-1.5 text-xs text-muted shadow">
            Read-only — connect Supabase to enable editing
          </div>
        )}

        {error ? (
          <div className="flex h-full items-center justify-center text-muted">{error}</div>
        ) : filtered ? (
          <OrgGraph brain={filtered} onSelect={setSelected} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">Loading graph…</div>
        )}

        <NodeDetailDrawer
          node={selected}
          edges={brain?.edges ?? []}
          nodes={brain?.nodes ?? []}
          editable={caps.editable}
          busy={busy}
          onClose={() => setSelected(null)}
          onNavigate={(n) => setSelected(n)}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDelete}
          onAddEdge={handleAddEdge}
          onRemoveEdge={handleRemoveEdge}
        />

        {/* Add-node modal */}
        {adding && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-panel p-5 shadow-2xl">
              <h2 className="mb-4 text-lg font-semibold">Add node</h2>
              <NodeEditor
                departments={departments}
                busy={busy}
                onSave={handleCreate}
                onCancel={() => setAdding(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
