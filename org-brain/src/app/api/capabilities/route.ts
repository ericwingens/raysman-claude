import { NextResponse } from "next/server";
import { isEditable, requiresEditToken } from "@/lib/env";

export const runtime = "nodejs";

// Lets the client know whether editing is available (Supabase connected) and
// whether a write token is required, so the UI can show/hide edit controls.
export async function GET() {
  return NextResponse.json({
    editable: isEditable(),
    requiresToken: requiresEditToken(),
  });
}
