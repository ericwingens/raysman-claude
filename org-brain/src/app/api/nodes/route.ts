import { NextResponse } from "next/server";
import { z } from "zod";
import { getGraph } from "@/lib/brain";
import { assertAuthorized, createNode } from "@/lib/mutations";
import { getEditToken, toErrorResponse } from "@/lib/api";
import { NODE_TYPES, BUSINESS_FUNCTIONS } from "@/lib/types";

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

const NodeCreateSchema = z.object({
  id: z.string().max(80).optional(),
  type: z.enum(NODE_TYPES),
  name: z.string().min(1).max(200),
  department: z.string().max(80).nullable().optional(),
  business_function: z.enum(BUSINESS_FUNCTIONS).nullable().optional(),
  content: z.string().max(8000).optional(),
  props: z.record(z.unknown()).optional(),
});

// Create a node.
export async function POST(req: Request) {
  try {
    assertAuthorized(getEditToken(req));
    const body = await req.json();
    const input = NodeCreateSchema.parse(body);
    const node = await createNode(input);
    return NextResponse.json({ node });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", issues: err.issues }, { status: 400 });
    }
    return toErrorResponse(err);
  }
}
