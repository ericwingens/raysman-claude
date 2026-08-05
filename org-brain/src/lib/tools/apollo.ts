import { tool } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";

// Apollo.io people-search tool. Dry-runs without an APOLLO_API_KEY.
export const apolloSearchPeople = tool({
  description:
    "Search Apollo.io for people/contacts matching a title, company, or keyword. Use for prospecting and lead enrichment questions.",
  parameters: z.object({
    query: z.string().describe("Free-text search, e.g. 'Head of Growth at fintech startups'"),
    perPage: z.number().int().min(1).max(25).optional(),
  }),
  execute: async ({ query, perPage }) => {
    if (!env.apolloKey) {
      return { dryRun: true, message: `Would search Apollo for: "${query}"` };
    }
    const res = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "x-api-key": env.apolloKey,
      },
      body: JSON.stringify({ q_keywords: query, per_page: perPage ?? 5 }),
    });
    if (!res.ok) {
      return { error: `Apollo API error ${res.status}` };
    }
    const json = (await res.json()) as {
      people?: { name?: string; title?: string; organization_name?: string }[];
    };
    return {
      people: (json.people ?? []).map((p) => ({
        name: p.name,
        title: p.title,
        company: p.organization_name,
      })),
    };
  },
});
