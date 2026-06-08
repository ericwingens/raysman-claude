import { NextResponse } from "next/server";
import { z } from "zod";
import { searchNodes } from "@/lib/brain";

export const runtime = "nodejs";

const QuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(25).optional(),
});

// Powers the TipTap @-mention menu and ad-hoc node lookup.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchNodes(parsed.data.q, parsed.data.limit ?? 8);
    return NextResponse.json({
      results: results.map((r) => ({
        id: r.id,
        type: r.type,
        label: r.name,
        department: r.department,
        score: r.score,
      })),
    });
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ results: [], error: "search_failed" }, { status: 500 });
  }
}
