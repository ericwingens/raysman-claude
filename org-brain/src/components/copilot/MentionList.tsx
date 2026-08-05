"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL, type NodeType } from "@/lib/types";

export interface MentionItem {
  id: string;
  type: NodeType;
  label: string;
  department?: string | null;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Props {
  items: MentionItem[];
  command: (item: { id: string; label: string; type: NodeType }) => void;
}

export const MentionList = forwardRef<MentionListRef, Props>(function MentionList(
  { items, command },
  ref,
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  function select(index: number) {
    const item = items[index];
    if (item) command({ id: item.id, label: item.label, type: item.type });
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelected((s) => (s + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return <div className="mention-menu px-3 py-2 text-sm text-muted">No matches</div>;
  }

  return (
    <div className="mention-menu">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="mention-item"
          data-selected={i === selected}
          onMouseEnter={() => setSelected(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            select(i);
          }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: NODE_TYPE_COLOR[item.type] }}
          />
          <span className="truncate text-fg">{item.label}</span>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {NODE_TYPE_LABEL[item.type]}
          </span>
        </div>
      ))}
    </div>
  );
});
