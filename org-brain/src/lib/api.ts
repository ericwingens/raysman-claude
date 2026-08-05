import { NextResponse } from "next/server";

/** Pull the optional write token from the request header. */
export function getEditToken(req: Request): string | null {
  return req.headers.get("x-edit-token");
}

/** Map mutation errors to clean HTTP responses. */
export function toErrorResponse(err: unknown): NextResponse {
  const name = err instanceof Error ? err.name : "";
  if (name === "UnauthorizedError") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (name === "NotConfiguredError") {
    return NextResponse.json({ error: "editing_not_configured" }, { status: 409 });
  }
  console.error("[mutation]", err);
  const message = err instanceof Error ? err.message : "unknown_error";
  return NextResponse.json({ error: message }, { status: 500 });
}
