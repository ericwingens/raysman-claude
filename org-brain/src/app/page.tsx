import Link from "next/link";
import { Network, MessageSquare, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Org Brain</h1>
        <p className="mt-3 text-balance text-muted">
          A typed, Obsidian-style knowledge graph of your organisation — people,
          AI sub-agents, tools, SOPs, and workflows — plus an{" "}
          <span className="text-fg">@-mention copilot</span> that answers
          grounded in the graph using Claude.
        </p>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/ai-brains/org"
          className="group rounded-xl border border-border bg-panel p-6 text-left transition-colors hover:border-accent/60"
        >
          <Network className="h-6 w-6 text-accent" />
          <h2 className="mt-3 flex items-center gap-2 font-semibold">
            Org Graph <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </h2>
          <p className="mt-1 text-sm text-muted">
            Explore the radial force graph. Filter by node type, cluster by
            business function, click any node for detail.
          </p>
        </Link>
        <Link
          href="/copilot-employee"
          className="group rounded-xl border border-border bg-panel p-6 text-left transition-colors hover:border-accent/60"
        >
          <MessageSquare className="h-6 w-6 text-accent" />
          <h2 className="mt-3 flex items-center gap-2 font-semibold">
            Copilot <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </h2>
          <p className="mt-1 text-sm text-muted">
            Chat with the brain. Type <code className="text-accent">@</code> to
            mention a node and inject its content as RAG context.
          </p>
        </Link>
      </div>
    </div>
  );
}
