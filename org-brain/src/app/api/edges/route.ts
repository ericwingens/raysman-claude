import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthorized, createEdge } from "@/lib/mutations";
import { getEditToken, toErrorResponse } from "@/lib/api";

export const runtime = "nodejs";

const REL_TYPES = [
  "reports_to",
  "member_of",
  "belongs_to",
  "uses",
  "follows",
  "owns",
  "triggers",
  "part_of",
] as const;

const EdgeCreateSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  rel_type: z.enum(REL_TYPES),
});

export async function POST(req: Request) {
  try {
    assertAuthorized(getEditToken(req));
    const { source, target, rel_type } = EdgeCreateSchema.parse(await req.json());
    if (source === target) {
      return NextResponse.json({ error: "self_edge_not_allowed" }, { status: 400 });
    }
    const edge = await createEdge(source, target, rel_type);
    return NextResponse.json({ edge });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", issues: err.issues }, { status: 400 });
    }
    return toErrorResponse(err);
  }
}
