"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { NODE_TYPE_COLOR, type GraphNode, type NodeType, type OrgBrain } from "@/lib/types";

const TYPE_GLYPH: Record<NodeType, string> = {
  person: "👤",
  subagent: "🤖",
  tool: "🔧",
  workflow: "🔀",
  sop: "📋",
  project: "📦",
  team: "👥",
  department: "🏛️",
};

// Larger nodes for structural types so the org skeleton reads at a glance.
const TYPE_RADIUS: Record<NodeType, number> = {
  department: 9,
  team: 7,
  person: 5,
  subagent: 5,
  workflow: 5,
  project: 5,
  sop: 4,
  tool: 4,
};

type FGNode = GraphNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type FGLink = { source: string; target: string; rel_type: string };

function departmentColor(dept: string | null): string {
  if (!dept) return "#64748b";
  let h = 0;
  for (let i = 0; i < dept.length; i++) h = (h * 31 + dept.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 60%)`;
}

export function OrgGraph({
  brain,
  onSelect,
}: {
  brain: OrgBrain;
  onSelect: (node: GraphNode) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink> | undefined>(undefined);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const data = useMemo(
    () => ({
      nodes: brain.nodes.map((n) => ({ ...n })) as FGNode[],
      links: brain.edges.map((e) => ({
        source: e.source,
        target: e.target,
        rel_type: e.rel_type,
      })) as FGLink[],
    }),
    [brain],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cluster by business_function (core left / enabling right) via a custom
  // d3 force — no extra dependency required.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    let nodes: FGNode[] = [];
    const cluster = (alpha: number) => {
      for (const n of nodes) {
        if (n.x == null || n.vx == null) continue;
        const targetX = n.business_function === "enabling" ? size.width * 0.18 : -size.width * 0.18;
        n.vx += (targetX - n.x) * 0.015 * alpha;
      }
    };
    (cluster as unknown as { initialize: (n: FGNode[]) => void }).initialize = (n) => {
      nodes = n;
    };
    fg.d3Force("cluster", cluster as never);
    fg.d3Force("charge")?.strength(-90);
    fg.d3ReheatSimulation();
  }, [data, size.width]);

  const drawNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = TYPE_RADIUS[node.type] ?? 5;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = departmentColor(node.department);
      ctx.fill();
      ctx.lineWidth = 1.5 / globalScale;
      ctx.strokeStyle = NODE_TYPE_COLOR[node.type];
      ctx.stroke();

      // Glyph inside the node, scaled to the node radius.
      ctx.font = `${r * 1.1}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(TYPE_GLYPH[node.type], x, y);

      // Labels only when zoomed in enough to be legible.
      if (globalScale > 1.6) {
        const fontSize = Math.min(4, 11 / globalScale);
        ctx.font = `${fontSize}px ${"var(--font-sans)"}`;
        ctx.fillStyle = "#cbd2e0";
        ctx.fillText(node.name, x, y + r + fontSize);
      }
    },
    [],
  );

  const paintPointerArea = useCallback(
    (node: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
      const r = (TYPE_RADIUS[node.type] ?? 5) + 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fill();
    },
    [],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        ref={fgRef}
        width={size.width}
        height={size.height}
        graphData={data}
        backgroundColor="#0b0e14"
        nodeRelSize={5}
        nodeLabel={(n: FGNode) => `${n.name} · ${n.type}`}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={paintPointerArea}
        linkColor={() => "rgba(148,163,184,0.18)"}
        linkWidth={0.5}
        linkDirectionalParticles={0}
        cooldownTicks={120}
        onNodeClick={(n: FGNode) => onSelect(n)}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
      />
    </div>
  );
}
