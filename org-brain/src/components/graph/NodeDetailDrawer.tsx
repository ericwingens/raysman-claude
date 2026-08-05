"use client";

import { useState } from "react";
import { X, Pencil, Trash2, Plus, Link2Off } from "lucide-react";
import {
  NODE_TYPE_COLOR,
  NODE_TYPE_LABEL,
  type GraphEdge,
  type GraphNode,
  type RelType,
} from "@/lib/types";
import { NodeEditor } from "./NodeEditor";
import type { NodeInput } from "@/lib/client-edit";

const REL_TYPES: RelType[] = [
  "reports_to",
  "member_of",
  "belongs_to",
  "uses",
  "follows",
  "owns",
  "triggers",
  "part_of",
];

export function NodeDetailDrawer({
  node,
  nodes,
  edges,
  editable,
  busy,
  onClose,
  onNavigate,
  onSaveEdit,
  onDelete,
  onAddEdge,
  onRemoveEdge,
}: {
  node: GraphNode | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  editable: boolean;
  busy: boolean;
  onClose: () => void;
  onNavigate: (n: GraphNode) => void;
  onSaveEdit: (id: string, input: NodeInput) => void;
  onDelete: (id: string) => void;
  onAddEdge: (source: string, target: string, rel: RelType) => void;
  onRemoveEdge: (edgeId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [addingEdge, setAddingEdge] = useState(false);
  const [newRel, setNewRel] = useState<RelType>("uses");
  const [newTarget, setNewTarget] = useState("");

  if (!node) return null;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const departments = nodes
    .filter((n) => n.type === "department")
    .map((n) => ({ id: n.id, name: n.name }));

  const related = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const dir = e.source === node.id ? "→" : "←";
      return { edgeId: e.id, rel: e.rel_type, dir, other: byId.get(otherId) };
    })
    .filter((r): r is { edgeId: string; rel: RelType; dir: string; other: GraphNode } =>
      Boolean(r.other),
    );

  function submitEdge() {
    if (!node || !newTarget) return;
    onAddEdge(node.id, newTarget, newRel);
    setAddingEdge(false);
    setNewTarget("");
  }

  return (
    <div className="absolute right-0 top-0 z-10 flex h-full w-96 flex-col border-l border-border bg-panel shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
            style={{ background: `${NODE_TYPE_COLOR[node.type]}22`, color: NODE_TYPE_COLOR[node.type] }}
          >
            {NODE_TYPE_LABEL[node.type]}
          </span>
          <h2 className="mt-2 truncate text-lg font-semibold leading-tight">{node.name}</h2>
          <p className="truncate text-xs text-muted">{node.id}</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted hover:bg-white/5 hover:text-fg">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 text-sm">
        {editing ? (
          <NodeEditor
            initial={node}
            departments={departments}
            busy={busy}
            onSave={(input) => {
              onSaveEdit(node.id, input);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            {editable && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-white/5"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${node.name}" and its connections?`)) onDelete(node.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}

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

            <section>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Connections ({related.length})
                </h3>
                {editable && !addingEdge && (
                  <button
                    onClick={() => setAddingEdge(true)}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>

              {addingEdge && (
                <div className="mb-2 space-y-2 rounded-md border border-border p-2">
                  <select
                    className="w-full rounded border border-border bg-bg px-2 py-1 text-xs"
                    value={newRel}
                    onChange={(e) => setNewRel(e.target.value as RelType)}
                  >
                    {REL_TYPES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    list="edge-target-options"
                    className="w-full rounded border border-border bg-bg px-2 py-1 text-xs"
                    placeholder="target node id…"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                  <datalist id="edge-target-options">
                    {nodes
                      .filter((n) => n.id !== node.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.type})
                        </option>
                      ))}
                  </datalist>
                  <div className="flex gap-2">
                    <button
                      onClick={submitEdge}
                      disabled={busy || !newTarget}
                      className="rounded bg-accent px-2 py-1 text-xs font-medium text-black disabled:opacity-50"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => setAddingEdge(false)}
                      className="rounded border border-border px-2 py-1 text-xs text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <ul className="space-y-1">
                {related.map((r) => (
                  <li key={r.edgeId} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/5">
                    <button
                      onClick={() => onNavigate(r.other)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="text-xs text-accent">{r.rel}</span>
                      <span className="text-muted">{r.dir}</span>
                      <span className="truncate">{r.other.name}</span>
                    </button>
                    {editable && (
                      <button
                        onClick={() => onRemoveEdge(r.edgeId)}
                        title="Remove connection"
                        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                      >
                        <Link2Off className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
