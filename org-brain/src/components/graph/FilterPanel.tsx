"use client";

import { NODE_TYPES, NODE_TYPE_COLOR, NODE_TYPE_LABEL, type NodeType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FilterPanel({
  active,
  counts,
  total,
  onToggle,
  onAll,
  onNone,
}: {
  active: Set<NodeType>;
  counts: Record<NodeType, number>;
  total: number;
  onToggle: (t: NodeType) => void;
  onAll: () => void;
  onNone: () => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 border-r border-border bg-panel p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Node types</h2>
        <span className="text-xs text-muted">{total} nodes</span>
      </div>
      <div className="flex gap-2 text-xs">
        <button onClick={onAll} className="rounded px-2 py-1 text-muted hover:bg-white/5 hover:text-fg">
          All
        </button>
        <button onClick={onNone} className="rounded px-2 py-1 text-muted hover:bg-white/5 hover:text-fg">
          None
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {NODE_TYPES.map((t) => {
          const on = active.has(t);
          return (
            <li key={t}>
              <button
                onClick={() => onToggle(t)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                  on ? "text-fg" : "text-muted opacity-50",
                  "hover:bg-white/5",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: NODE_TYPE_COLOR[t] }}
                  />
                  {NODE_TYPE_LABEL[t]}
                </span>
                <span className="text-xs text-muted">{counts[t] ?? 0}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto text-xs leading-relaxed text-muted">
        Fill colour = department. Ring colour = node type. Core vs. enabling
        functions cluster left/right.
      </p>
    </aside>
  );
}
