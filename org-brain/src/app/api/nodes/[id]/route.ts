import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthorized, updateNode, deleteNode } from "@/lib/mutations";
import { getEditToken, toErrorResponse } from "@/lib/api";
import { NODE_TYPES, BUSINESS_FUNCTIONS } from "@/lib/types";

export const runtime = "nodejs";

const NodePatchSchema = z.object({
  type: z.enum(NODE_TYPES).optional(),
  name: z.string().min(1).max(200).optional(),
  department: z.string().max(80).nullable().optional(),
  business_function: z.enum(BUSINESS_FUNCTIONS).nullable().optional(),
  content: z.string().max(8000).optional(),
  props: z.record(z.unknown()).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertAuthorized(getEditToken(req));
    const { id } = await ctx.params;
    const patch = NodePatchSchema.parse(await req.json());
    const node = await updateNode(id, patch);
    return NextResponse.json({ node });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_input", issues: err.issues }, { status: 400 });
    }
    return toErrorResponse(err);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertAuthorized(getEditToken(req));
    const { id } = await ctx.params;
    await deleteNode(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
