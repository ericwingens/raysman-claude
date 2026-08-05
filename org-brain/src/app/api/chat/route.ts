import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type CoreMessage } from "ai";
import { z } from "zod";
import { env, hasAnthropic } from "@/lib/env";
import { getNodesByIds, searchNodes } from "@/lib/brain";
import { buildDocumentContext, SYSTEM_PROMPT } from "@/lib/rag";
import { asanaCreateTask } from "@/lib/tools/asana";
import { apolloSearchPeople } from "@/lib/tools/apollo";

export const runtime = "nodejs";
export const maxDuration = 60;

const MentionSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
});

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
  // Mentions attached to the latest user turn by the editor.
  mentions: z.array(MentionSchema).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages, mentions = [] } = parsed.data;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUser?.content ?? "";

  // 1) Resolve @-mentioned nodes to their full content.
  const mentioned = await getNodesByIds(mentions.map((m) => m.id));

  // 2) Vector/keyword search over the free-text query for extra context.
  const hits = await searchNodes(query, 5);
  const mentionedIds = new Set(mentioned.map((n) => n.id));
  const retrieved = [...mentioned, ...hits.filter((h) => !mentionedIds.has(h.id))];

  const documentContext = buildDocumentContext(retrieved);
  const system = documentContext
    ? `${SYSTEM_PROMPT}\n\nUse the following retrieved context to answer.\n\n${documentContext}`
    : SYSTEM_PROMPT;

  // 3) Offline fallback: no Anthropic key → deterministic grounded summary.
  if (!hasAnthropic()) {
    return new Response(offlineAnswer(query, retrieved), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const coreMessages: CoreMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = streamText({
    model: anthropic(env.anthropicModel),
    system,
    messages: coreMessages,
    maxTokens: 1024,
    tools: {
      asanaCreateTask,
      apolloSearchPeople,
    },
    maxSteps: 4,
  });

  // Plain text stream so the client can use one protocol for both the Claude
  // path and the offline fallback below.
  return result.toTextStreamResponse();
}

function offlineAnswer(
  query: string,
  nodes: { name: string; id: string; type: string; content: string }[],
): string {
  if (nodes.length === 0) {
    return `**Offline mode** (no ANTHROPIC_API_KEY set).\n\nI couldn't find anything in the org brain matching "${query}". Try mentioning a node with @ or rephrasing.`;
  }
  const lines = nodes
    .slice(0, 5)
    .map((n) => `- **${n.name}** (\`${n.type}\`): ${n.content.slice(0, 220)}${n.content.length > 220 ? "…" : ""}`)
    .join("\n");
  return [
    `**Offline mode** (no ANTHROPIC_API_KEY set) — returning the retrieved context directly.`,
    ``,
    `Here is what the org brain knows that relates to "${query}":`,
    ``,
    lines,
    ``,
    `Set ANTHROPIC_API_KEY to get a synthesized answer from Claude (${env.anthropicModel}).`,
  ].join("\n");
}
