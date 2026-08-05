/**
 * Ingest the local seed (or any OrgBrain JSON) into Supabase: embeds each
 * node's `content` with Voyage AI and upserts nodes + edges.
 *
 *   npx tsx scripts/ingest.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and VOYAGE_API_KEY.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import type { OrgBrain } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const VOYAGE_KEY = process.env.VOYAGE_API_KEY ?? "";
const VOYAGE_MODEL = process.env.VOYAGE_MODEL ?? "voyage-4";
const VOYAGE_DIM = Number(process.env.VOYAGE_DIMENSIONS ?? 1024);

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function embedBatch(texts: string[]): Promise<(number[] | null)[]> {
  if (!VOYAGE_KEY) return texts.map(() => null);
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOYAGE_KEY}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: "document",
      output_dimension: VOYAGE_DIM,
    }),
  });
  if (!res.ok) throw new Error(`Voyage error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function main() {
  const path = resolve(__dirname, "../src/data/seed.json");
  const brain = JSON.parse(readFileSync(path, "utf8")) as OrgBrain;
  console.log(`Loaded ${brain.nodes.length} nodes, ${brain.edges.length} edges from seed.`);

  // Embed nodes in batches (Voyage accepts arrays).
  const BATCH = 64;
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < brain.nodes.length; i += BATCH) {
    const chunk = brain.nodes.slice(i, i + BATCH);
    const embeddings = await embedBatch(chunk.map((n) => n.content || n.name));
    chunk.forEach((n, j) => {
      rows.push({
        id: n.id,
        type: n.type,
        name: n.name,
        department: n.department,
        business_function: n.business_function,
        content: n.content,
        props: n.props,
        embedding: embeddings[j],
      });
    });
    console.log(`Embedded ${Math.min(i + BATCH, brain.nodes.length)}/${brain.nodes.length}`);
  }

  const { error: nodesErr } = await supabase.from("nodes").upsert(rows, { onConflict: "id" });
  if (nodesErr) throw new Error(`nodes upsert: ${nodesErr.message}`);

  const { error: edgesErr } = await supabase
    .from("edges")
    .upsert(brain.edges, { onConflict: "id" });
  if (edgesErr) throw new Error(`edges upsert: ${edgesErr.message}`);

  console.log("✓ Ingest complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
