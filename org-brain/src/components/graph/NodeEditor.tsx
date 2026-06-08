"use client";

import { useState } from "react";
import {
  NODE_TYPES,
  NODE_TYPE_LABEL,
  BUSINESS_FUNCTIONS,
  type GraphNode,
  type NodeType,
} from "@/lib/types";
import type { NodeInput } from "@/lib/client-edit";

const inputCls =
  "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm focus:border-accent/60 focus:outline-none";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";

export function NodeEditor({
  initial,
  departments,
  busy,
  onSave,
  onCancel,
}: {
  initial?: GraphNode | null;
  departments: { id: string; name: string }[];
  busy?: boolean;
  onSave: (input: NodeInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<NodeType>(initial?.type ?? "subagent");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [businessFunction, setBusinessFunction] = useState<string>(
    initial?.business_function ?? "",
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [propsText, setPropsText] = useState(
    JSON.stringify(initial?.props ?? {}, null, 2),
  );
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    let props: Record<string, unknown> = {};
    if (propsText.trim()) {
      try {
        props = JSON.parse(propsText);
      } catch {
        setError("Properties must be valid JSON.");
        return;
      }
    }
    onSave({
      type,
      name: name.trim(),
      department: department.trim() || null,
      business_function: (businessFunction || null) as "core" | "enabling" | null,
      content,
      props,
    });
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className={labelCls}>Name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Type</label>
          <select
            className={inputCls}
            value={type}
            onChange={(e) => setType(e.target.value as NodeType)}
          >
            {NODE_TYPES.map((t) => (
              <option key={t} value={t}>
                {NODE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Business function</label>
          <select
            className={inputCls}
            value={businessFunction}
            onChange={(e) => setBusinessFunction(e.target.value)}
          >
            <option value="">— none —</option>
            {BUSINESS_FUNCTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Department</label>
        <input
          className={inputCls}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          list="dept-options"
          placeholder="dept_growth"
        />
        <datalist id="dept-options">
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </datalist>
      </div>

      <div>
        <label className={labelCls}>Description (embedded for RAG)</label>
        <textarea
          className={`${inputCls} min-h-[6rem] resize-y`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What this node is and does. For a sub-agent: its purpose, model, and tools."
        />
      </div>

      <div>
        <label className={labelCls}>
          Properties (JSON) — e.g. {"{"} &quot;model&quot;: &quot;claude-sonnet-4-6&quot;, &quot;tools&quot;: [&quot;t_apollo&quot;] {"}"}
        </label>
        <textarea
          className={`${inputCls} min-h-[5rem] resize-y font-mono text-xs`}
          value={propsText}
          onChange={(e) => setPropsText(e.target.value)}
          spellCheck={false}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:text-fg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
