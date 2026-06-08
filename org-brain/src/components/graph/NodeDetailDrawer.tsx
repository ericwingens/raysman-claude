"use client";

import { X } from "lucide-react";
import {
  NODE_TYPE_COLOR,
  NODE_TYPE_LABEL,
  type GraphEdge,
  type GraphNode,
  type RelType,
} from "@/lib/types";

export function NodeDetailDrawer({
  node,
  nodes,
  edges,
  onClose,
  onNavigate,
}: {
  node: GraphNode | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
  onNavigate: (n: GraphNode) => void;
}) {
  if (!node) return null;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const related = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const dir = e.source === node.id ? "→" : "←";
      return { rel: e.rel_type, dir, other: byId.get(otherId) };
    })
    .filter((r): r is { rel: RelType; dir: string; other: GraphNode } => Boolean(r.other));

  return (
    <div className="absolute right-0 top-0 z-10 flex h-full w-96 flex-col border-l border-border bg-panel shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
            style={{
              background: `${NODE_TYPE_COLOR[node.type]}22`,
              color: NODE_TYPE_COLOR[node.type],
            }}
          >
            {NODE_TYPE_LABEL[node.type]}
          </span>
          <h2 className="mt-2 text-lg font-semibold leading-tight">{node.name}</h2>
          <p className="text-xs text-muted">{node.id}</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted hover:bg-white/5 hover:text-fg">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 text-sm">
        {node.content && (
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">About</h3>
            <p className="leading-relaxed text-fg/90">{node.content}</p>
          </section>
        )}

        {Object.keys(node.props ?? {}).length > 0 && (
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Properties
            </h3>
            <dl className="space-y-1">
              {Object.entries(node.props).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-32 shrink-0 text-muted">{k}</dt>
                  <dd className="break-words text-fg/90">
                    {Array.isArray(v) ? v.join(", ") : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Connections ({related.length})
            </h3>
            <ul className="space-y-1">
              {related.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => onNavigate(r.other)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5"
                  >
                    <span className="text-xs text-accent">{r.rel}</span>
                    <span className="text-muted">{r.dir}</span>
                    <span className="truncate">{r.other.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
