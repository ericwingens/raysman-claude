import { tool } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";

// Minimal Asana "create task" tool the copilot can call. Real network calls
// only happen when ASANA_ACCESS_TOKEN is set; otherwise it returns a dry-run.
export const asanaCreateTask = tool({
  description:
    "Create a task in Asana. Use when the user asks to capture an action item, todo, or follow-up.",
  parameters: z.object({
    name: z.string().describe("Short task title"),
    notes: z.string().optional().describe("Task description / details"),
    projectGid: z.string().optional().describe("Asana project GID to add the task to"),
  }),
  execute: async ({ name, notes, projectGid }) => {
    if (!env.asanaToken) {
      return { dryRun: true, message: `Would create Asana task: "${name}"` };
    }
    const res = await fetch("https://app.asana.com/api/1.0/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.asanaToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: { name, notes, projects: projectGid ? [projectGid] : undefined },
      }),
    });
    if (!res.ok) {
      return { error: `Asana API error ${res.status}` };
    }
    const json = (await res.json()) as { data?: { gid?: string; permalink_url?: string } };
    return { gid: json.data?.gid, url: json.data?.permalink_url };
  },
});
