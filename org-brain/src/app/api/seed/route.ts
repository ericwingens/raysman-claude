import { NextResponse } from "next/server";
import { assertAuthorized, seedFromLocal, countNodes } from "@/lib/mutations";
import { getEditToken, toErrorResponse } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

// Idempotently load the bundled seed graph into Supabase. Used once after
// connecting Supabase so the live app has data to edit.
export async function POST(req: Request) {
  try {
    assertAuthorized(getEditToken(req));
    const result = await seedFromLocal();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// Report how many nodes exist (so the UI can offer "Load seed data" when empty).
export async function GET() {
  try {
    const count = await countNodes();
    return NextResponse.json({ count });
  } catch (err) {
    return toErrorResponse(err);
  }
}
