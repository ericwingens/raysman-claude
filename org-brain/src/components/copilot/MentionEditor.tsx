"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { useCallback } from "react";
import { mentionSuggestion } from "./suggestion";
import type { MentionRef, NodeType } from "@/lib/types";
import type { JSONContent } from "@tiptap/react";

// Mention node extended to carry the node `type` alongside id + label, so the
// chip resolves back to a structured {id, type, label} reference on submit.
const OrgMention = Mention.extend({
  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      type: { default: null },
    };
  },
}).configure({
  HTMLAttributes: { class: "mention" },
  suggestion: mentionSuggestion,
});

export interface SubmitPayload {
  text: string;
  mentions: MentionRef[];
}

export function MentionEditor({
  onSubmit,
  disabled,
}: {
  onSubmit: (payload: SubmitPayload) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Ask the org brain…  type @ to mention a node",
      }),
      OrgMention,
    ],
    editorProps: {
      attributes: {
        class: "px-3 py-2 text-sm leading-relaxed focus:outline-none",
      },
    },
  });

  const submit = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    const { text, mentions } = extractContent(json);
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), mentions });
    editor.commands.clearContent();
  }, [editor, onSubmit]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-panel focus-within:border-accent/60">
      <div
        onKeyDown={(e) => {
          // Enter submits; Shift+Enter (and the mention menu) are left alone.
          if (e.key === "Enter" && !e.shiftKey) {
            // If the suggestion popup is open, TipTap handled it already.
            const menuOpen = document.querySelector(".mention-menu");
            if (!menuOpen) {
              e.preventDefault();
              submit();
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <span className="text-xs text-muted">
          <kbd className="rounded bg-white/5 px-1">@</kbd> mention ·{" "}
          <kbd className="rounded bg-white/5 px-1">Enter</kbd> to send
        </span>
        <button
          onClick={submit}
          disabled={disabled}
          className="rounded-md bg-accent px-3 py-1 text-sm font-medium text-black disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Walk the ProseMirror JSON to recover plain text (with @label inline) and the
// structured list of mentions.
function extractContent(json: JSONContent): { text: string; mentions: MentionRef[] } {
  const mentions: MentionRef[] = [];
  let text = "";

  function walk(node: JSONContent) {
    if (node.type === "text") {
      text += node.text ?? "";
    } else if (node.type === "mention") {
      const attrs = (node.attrs ?? {}) as { id?: string; label?: string; type?: string };
      if (attrs.id) {
        mentions.push({
          id: attrs.id,
          label: attrs.label ?? attrs.id,
          type: (attrs.type as NodeType) ?? "person",
        });
        text += `@${attrs.label ?? attrs.id}`;
      }
    }
    if (node.content) {
      node.content.forEach(walk);
      if (node.type === "paragraph") text += "\n";
    }
  }

  walk(json);
  return { text, mentions };
}
