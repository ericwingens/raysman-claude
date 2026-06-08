import { NextResponse } from "next/server";
import { assertAuthorized, deleteEdge } from "@/lib/mutations";
import { getEditToken, toErrorResponse } from "@/lib/api";

export const runtime = "nodejs";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertAuthorized(getEditToken(req));
    const { id } = await ctx.params;
    await deleteEdge(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
