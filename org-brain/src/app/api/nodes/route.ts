import { NextResponse } from "next/server";
import { getGraph } from "@/lib/brain";

export const runtime = "nodejs";

// Returns the full graph (nodes + edges) for the visualization. The client
// reads this via SWR-less fetch on mount.
export async function GET() {
  try {
    const graph = await getGraph();
    return NextResponse.json(graph);
  } catch (err) {
    console.error("[/api/nodes]", err);
    return NextResponse.json({ nodes: [], edges: [], error: "load_failed" }, { status: 500 });
  }
}
