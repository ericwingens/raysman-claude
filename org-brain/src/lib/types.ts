// Domain model for the Org Brain knowledge graph.
// Everything in the graph is a typed node; relationships are typed edges.

export const NODE_TYPES = [
  "person",
  "subagent",
  "tool",
  "workflow",
  "sop",
  "project",
  "team",
  "department",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const BUSINESS_FUNCTIONS = ["core", "enabling"] as const;
export type BusinessFunction = (typeof BUSINESS_FUNCTIONS)[number];

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  /** Department id this node belongs to (or its own id for department nodes). */
  department: string | null;
  business_function: BusinessFunction | null;
  /** Free-text body that gets embedded for RAG. */
  content: string;
  /** Arbitrary typed metadata (role, model, reports_to, tools, …). */
  props: Record<string, unknown>;
}

export type RelType =
  | "reports_to"
  | "member_of"
  | "belongs_to"
  | "uses"
  | "follows"
  | "owns"
  | "triggers"
  | "part_of";

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rel_type: RelType;
  props?: Record<string, unknown>;
}

export interface OrgBrain {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

/** A resolved @-mention chip inserted by the TipTap editor. */
export interface MentionRef {
  id: string;
  type: NodeType;
  label: string;
}

export const NODE_TYPE_LABEL: Record<NodeType, string> = {
  person: "Person",
  subagent: "Sub-agent",
  tool: "Tool",
  workflow: "Workflow",
  sop: "SOP",
  project: "Project",
  team: "Team",
  department: "Department",
};

// Stable colors keyed by node type — used by the graph renderer and chips.
export const NODE_TYPE_COLOR: Record<NodeType, string> = {
  person: "#60a5fa",
  subagent: "#a78bfa",
  tool: "#34d399",
  workflow: "#f59e0b",
  sop: "#f472b6",
  project: "#22d3ee",
  team: "#94a3b8",
  department: "#e2e8f0",
};
