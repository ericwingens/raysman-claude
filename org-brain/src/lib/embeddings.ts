import { env, hasVoyage } from "@/lib/env";

// Anthropic does not ship a first-party embedding model; their docs recommend
// Voyage AI. We call the Voyage REST API directly to avoid an extra dependency.
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export interface EmbedOptions {
  /** "query" or "document" — Voyage uses this to tune the embedding. */
  inputType?: "query" | "document";
}

/**
 * Embed one or more texts with Voyage. Returns null when Voyage is not
 * configured, signaling callers to fall back to keyword search.
 */
export async function embed(
  input: string | string[],
  opts: EmbedOptions = {},
): Promise<number[][] | null> {
  if (!hasVoyage()) return null;

  const texts = Array.isArray(input) ? input : [input];
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.voyageApiKey}`,
    },
    body: JSON.stringify({
      model: env.voyageModel,
      input: texts,
      input_type: opts.inputType ?? "document",
      output_dimension: env.voyageDimensions,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Voyage embeddings failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
  };
  // Preserve input order.
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function embedOne(
  text: string,
  opts: EmbedOptions = {},
): Promise<number[] | null> {
  const out = await embed(text, opts);
  return out ? out[0] : null;
}
