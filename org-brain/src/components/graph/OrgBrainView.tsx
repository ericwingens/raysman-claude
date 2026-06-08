"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { FilterPanel } from "@/components/graph/FilterPanel";
import { NodeDetailDrawer } from "@/components/graph/NodeDetailDrawer";
import { NODE_TYPES, type GraphNode, type NodeType, type OrgBrain } from "@/lib/types";

// react-force-graph must be loaded client-only (it touches window/canvas).
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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/nodes")
      .then((r) => r.json())
      .then((data: OrgBrain) => {
        if (!cancelled) setBrain(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load the graph.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter nodes by active type, then drop edges whose endpoints were removed.
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

  function toggle(type: NodeType) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

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
          onClose={() => setSelected(null)}
          onNavigate={(n) => setSelected(n)}
        />
      </div>
    </div>
  );
}
