import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORS for the /api/* routes so the standalone dashboard.html (opened from a
// file:// path or pasted into a Claude artifact) can call the deployed API.
// Writes are still gated by the optional x-edit-token, so reflecting the origin
// here is safe (no cookies are used).
function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-edit-token",
    "Access-Control-Max-Age": "86400",
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(origin))) res.headers.set(k, v);
  return res;
}

export const config = { matcher: "/api/:path*" };
