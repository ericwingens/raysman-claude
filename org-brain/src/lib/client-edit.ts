"use client";

import type { GraphNode, NodeType, RelType } from "@/lib/types";

const TOKEN_KEY = "org-brain-edit-token";

export interface Capabilities {
  editable: boolean;
  requiresToken: boolean;
}

export function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

/** Prompt for the write token when the server requires one and we don't have it. */
export function ensureToken(caps: Capabilities): string {
  if (!caps.requiresToken) return "";
  let token = getStoredToken();
  if (!token) {
    token = window.prompt("Enter the edit token to make changes:") ?? "";
    if (token) setStoredToken(token);
  }
  return token;
}

class EditError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function mutate<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-edit-token": getStoredToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // Stored token is wrong/stale — drop it so the next attempt re-prompts.
      setStoredToken("");
    }
    throw new EditError(json.error ?? `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

export interface NodeInput {
  id?: string;
  type: NodeType;
  name: string;
  department?: string | null;
  business_function?: "core" | "enabling" | null;
  content?: string;
  props?: Record<string, unknown>;
}

export const api = {
  capabilities: async (): Promise<Capabilities> => {
    const res = await fetch("/api/capabilities");
    return res.json();
  },
  seedCount: async (): Promise<number> => {
    const res = await fetch("/api/seed");
    const json = await res.json().catch(() => ({ count: 0 }));
    return json.count ?? 0;
  },
  loadSeed: () => mutate<{ ok: boolean; nodes: number; edges: number }>("/api/seed", "POST"),
  createNode: (input: NodeInput) => mutate<{ node: GraphNode }>("/api/nodes", "POST", input),
  updateNode: (id: string, patch: Partial<NodeInput>) =>
    mutate<{ node: GraphNode }>(`/api/nodes/${encodeURIComponent(id)}`, "PATCH", patch),
  deleteNode: (id: string) => mutate<{ ok: boolean }>(`/api/nodes/${encodeURIComponent(id)}`, "DELETE"),
  createEdge: (source: string, target: string, rel_type: RelType) =>
    mutate<{ edge: unknown }>("/api/edges", "POST", { source, target, rel_type }),
  deleteEdge: (id: string) => mutate<{ ok: boolean }>(`/api/edges/${encodeURIComponent(id)}`, "DELETE"),
};
