import type { GraphNode } from "@/lib/types";
import { NODE_TYPE_LABEL } from "@/lib/types";

/**
 * Wrap retrieved nodes as <document> blocks. Anthropic recommends wrapping each
 * retrieved document in <document> tags with <source> and <document_content>
 * subtags so Claude can attribute and reason over them cleanly.
 */
export function buildDocumentContext(nodes: GraphNode[]): string {
  if (nodes.length === 0) return "";
  const docs = nodes
    .map((n, i) => {
      const meta = [
        `type: ${NODE_TYPE_LABEL[n.type] ?? n.type}`,
        n.department ? `department: ${n.department}` : null,
        n.business_function ? `business_function: ${n.business_function}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
      return [
        `<document index="${i + 1}">`,
        `<source>${escapeXml(n.name)} (${n.id}) — ${meta}</source>`,
        `<document_content>`,
        escapeXml(n.content || "(no description)"),
        `</document_content>`,
        `</document>`,
      ].join("\n");
    })
    .join("\n");
  return `<documents>\n${docs}\n</documents>`;
}

export const SYSTEM_PROMPT = `You are the Org Brain Copilot — an assistant that answers questions about a company's "AI organisation brain": its departments, teams, people (referenced by role, not real names), AI sub-agents, tools, SOPs, workflows, and how they connect.

Guidelines:
- Ground every answer in the provided <documents>. If the documents do not contain the answer, say so plainly rather than inventing details.
- Cite the specific nodes you used by their name and id when relevant.
- When the user @-mentions a node, treat its content as the primary focus of the question.
- Be concise and structured. Prefer short paragraphs and tight bullet lists.
- People are pseudonymous (role titles only). Never fabricate personal data.`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
