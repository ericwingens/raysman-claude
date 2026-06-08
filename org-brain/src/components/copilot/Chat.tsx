"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { Loader2, RotateCw, Square } from "lucide-react";
import { MentionEditor, type SubmitPayload } from "./MentionEditor";

export function Chat() {
  const { messages, append, status, error, reload, stop } = useChat({
    api: "/api/chat",
    // Both server paths (Claude stream + offline fallback) emit a plain text
    // stream, so we use the text protocol uniformly.
    streamProtocol: "text",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit({ text, mentions }: SubmitPayload) {
    if (busy) return;
    append({ role: "user", content: text }, { body: { mentions } });
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="mt-10 text-center text-muted">
            <p className="text-lg text-fg">Ask the org brain anything.</p>
            <p className="mt-2 text-sm">
              Try: <span className="text-accent">“What does @SEO Sub-Agent do and which SOP does it follow?”</span>
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <div
              className={`mt-0.5 h-7 w-7 shrink-0 rounded-full text-center text-xs leading-7 ${
                m.role === "user" ? "bg-white/10 text-fg" : "bg-accent/20 text-accent"
              }`}
            >
              {m.role === "user" ? "You" : "AI"}
            </div>
            <div className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-fg/90">
              {m.content}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex items-center gap-2 pl-10 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}

        {error && (
          <div className="ml-10 flex items-center gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <span>Something went wrong.</span>
            <button onClick={() => reload()} className="inline-flex items-center gap-1 underline">
              <RotateCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        {busy && (
          <button
            onClick={stop}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted hover:text-fg"
          >
            <Square className="h-3 w-3" /> Stop
          </button>
        )}
        <MentionEditor onSubmit={handleSubmit} disabled={busy} />
      </div>
    </div>
  );
}
