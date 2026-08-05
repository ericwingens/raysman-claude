"use client";

import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance, type GetReferenceClientRect } from "tippy.js";
import { MentionList, type MentionItem, type MentionListRef } from "./MentionList";

// Async @-mention source: every keystroke after `@` hits /api/search, which
// runs the same hybrid (vector/keyword) search used by the RAG pipeline.
export const mentionSuggestion: Omit<SuggestionOptions, "editor"> = {
  items: async ({ query }) => {
    if (!query) return [];
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      const json = (await res.json()) as { results?: MentionItem[] };
      return json.results ?? [];
    } catch {
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer<MentionListRef> | null = null;
    let popup: Instance[] | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });
        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate: (props) => {
        component?.updateProps(props);
        if (props.clientRect && popup) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          });
        }
      },

      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          popup?.[0].hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit: () => {
        popup?.[0].destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
};
