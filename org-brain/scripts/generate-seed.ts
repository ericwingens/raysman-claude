/**
 * Generates a realistic, referentially-consistent "AI organisation brain" and
 * writes it to src/data/seed.json. People are pseudonymous (role titles only),
 * per the GDPR note in the README.
 *
 *   npx tsx scripts/generate-seed.ts
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  BusinessFunction,
  GraphEdge,
  GraphNode,
  NodeType,
  RelType,
} from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];
let edgeSeq = 0;

function addNode(n: GraphNode) {
  nodes.push(n);
  return n.id;
}
function addEdge(source: string, target: string, rel_type: RelType) {
  edges.push({ id: `e_${edgeSeq++}`, source, target, rel_type });
}

interface DeptSpec {
  id: string;
  name: string;
  business_function: BusinessFunction;
  teams: TeamSpec[];
}
interface TeamSpec {
  id: string;
  name: string;
  lead: string;
  roles: string[];
  agents: { id: string; name: string; purpose: string; tools: string[] }[];
  sops: { id: string; name: string; summary: string }[];
  workflows: { id: string; name: string; trigger: string; uses: string[] }[];
}

// Shared tool catalog (referenced by id from agents/workflows).
const TOOLS: { id: string; name: string; kind: string; about: string }[] = [
  { id: "t_apollo", name: "Apollo.io", kind: "integration", about: "Sales intelligence and prospecting database used for lead enrichment and contact discovery." },
  { id: "t_asana", name: "Asana", kind: "integration", about: "Work management tool used to track tasks, projects, and cross-team handoffs." },
  { id: "t_hubspot", name: "HubSpot", kind: "integration", about: "CRM and marketing automation platform of record for contacts and deals." },
  { id: "t_slack", name: "Slack", kind: "integration", about: "Primary internal communication and notification surface for agents and humans." },
  { id: "t_gsc", name: "Google Search Console", kind: "integration", about: "Search performance data source used by SEO agents to prioritize content." },
  { id: "t_stripe", name: "Stripe", kind: "integration", about: "Payments and billing platform; source of revenue and subscription data." },
  { id: "t_snowflake", name: "Snowflake", kind: "integration", about: "Central data warehouse where product, finance, and marketing data are modeled." },
  { id: "t_zendesk", name: "Zendesk", kind: "integration", about: "Customer support ticketing system and knowledge base." },
  { id: "t_github", name: "GitHub", kind: "integration", about: "Source control and CI used by the engineering and automation teams." },
  { id: "t_docusign", name: "DocuSign", kind: "integration", about: "E-signature platform used for contracts and compliance workflows." },
];

const DEPARTMENTS: DeptSpec[] = [
  {
    id: "dept_strategy",
    name: "Strategy & Leadership",
    business_function: "core",
    teams: [
      {
        id: "team_exec",
        name: "Executive",
        lead: "Chief Executive Officer",
        roles: ["Chief of Staff"],
        agents: [
          { id: "a_briefing", name: "Exec Briefing Agent", purpose: "Compile a daily cross-department briefing from team updates and KPIs.", tools: ["t_slack", "t_snowflake"] },
        ],
        sops: [
          { id: "sop_okr", name: "Quarterly OKR Planning SOP", summary: "How leadership sets, cascades, and reviews quarterly objectives and key results." },
        ],
        workflows: [
          { id: "wf_weekly_review", name: "Weekly Business Review Workflow", trigger: "schedule_monday_08:00", uses: ["a_briefing", "t_snowflake", "t_slack"] },
        ],
      },
    ],
  },
  {
    id: "dept_product",
    name: "Product Management",
    business_function: "core",
    teams: [
      {
        id: "team_core_product",
        name: "Core Product",
        lead: "Head of Product",
        roles: ["Senior Product Manager", "Product Manager"],
        agents: [
          { id: "a_feedback", name: "Feedback Triage Agent", purpose: "Cluster inbound product feedback into themes and tag against the roadmap.", tools: ["t_zendesk", "t_slack"] },
          { id: "a_specwriter", name: "Spec Drafting Agent", purpose: "Draft PRDs from a one-line problem statement and linked research.", tools: ["t_asana"] },
        ],
        sops: [
          { id: "sop_discovery", name: "Product Discovery SOP", summary: "Continuous discovery process: interviews, opportunity solution trees, and validation gates before build." },
        ],
        workflows: [
          { id: "wf_feedback", name: "Feedback-to-Roadmap Workflow", trigger: "new_zendesk_tag", uses: ["a_feedback", "t_zendesk", "t_asana"] },
        ],
      },
    ],
  },
  {
    id: "dept_growth",
    name: "Marketing & Growth",
    business_function: "core",
    teams: [
      {
        id: "team_demandgen",
        name: "Demand Gen",
        lead: "Head of Growth",
        roles: ["Growth Marketer", "Lifecycle Marketer"],
        agents: [
          { id: "a_seo", name: "SEO Sub-Agent", purpose: "Plan and draft SEO content briefs from keyword gaps and search performance.", tools: ["t_gsc", "t_apollo"] },
          { id: "a_outbound", name: "Outbound Sequencer Agent", purpose: "Build and personalize multi-step outbound sequences for target accounts.", tools: ["t_apollo", "t_hubspot"] },
        ],
        sops: [
          { id: "sop_outbound", name: "Outbound Sequence SOP", summary: "Standard 5-touch outbound cadence with personalization rules and compliance guardrails." },
          { id: "sop_content", name: "Content Production SOP", summary: "Brief → draft → SEO review → publish pipeline with quality and brand checks." },
        ],
        workflows: [
          { id: "wf_lead", name: "Lead Enrichment Workflow", trigger: "new_lead", uses: ["a_outbound", "t_apollo", "t_hubspot"] },
        ],
      },
    ],
  },
  {
    id: "dept_sales",
    name: "Sales",
    business_function: "core",
    teams: [
      {
        id: "team_ae",
        name: "Account Executives",
        lead: "Head of Sales",
        roles: ["Account Executive", "Sales Development Rep"],
        agents: [
          { id: "a_dealdesk", name: "Deal Desk Agent", purpose: "Assemble quotes, check approval thresholds, and prep contract drafts.", tools: ["t_hubspot", "t_docusign"] },
        ],
        sops: [
          { id: "sop_dealdesk", name: "Deal Desk Approval SOP", summary: "Discount and contract approval matrix by deal size and term." },
        ],
        workflows: [
          { id: "wf_quote", name: "Quote-to-Contract Workflow", trigger: "stage_negotiation", uses: ["a_dealdesk", "t_hubspot", "t_docusign"] },
        ],
      },
    ],
  },
  {
    id: "dept_cs",
    name: "Customer & Admin",
    business_function: "core",
    teams: [
      {
        id: "team_support",
        name: "Customer Support",
        lead: "Head of Customer Success",
        roles: ["Customer Success Manager", "Support Specialist"],
        agents: [
          { id: "a_triage", name: "Ticket Triage Agent", purpose: "Classify, prioritize, and route inbound support tickets; draft first replies.", tools: ["t_zendesk", "t_slack"] },
        ],
        sops: [
          { id: "sop_escalation", name: "Support Escalation SOP", summary: "Severity definitions and escalation paths from tier-1 support to engineering on-call." },
        ],
        workflows: [
          { id: "wf_triage", name: "Ticket Triage Workflow", trigger: "new_ticket", uses: ["a_triage", "t_zendesk"] },
        ],
      },
    ],
  },
  {
    id: "dept_ops",
    name: "Operations & Supply Chain",
    business_function: "enabling",
    teams: [
      {
        id: "team_ops",
        name: "Business Operations",
        lead: "Head of Operations",
        roles: ["Operations Analyst"],
        agents: [
          { id: "a_vendor", name: "Vendor Review Agent", purpose: "Monitor vendor SLAs and flag renewals or breaches.", tools: ["t_asana", "t_slack"] },
        ],
        sops: [
          { id: "sop_vendor", name: "Vendor Onboarding SOP", summary: "Due-diligence, security review, and DPA checklist for onboarding a new vendor." },
        ],
        workflows: [
          { id: "wf_renewal", name: "Vendor Renewal Workflow", trigger: "renewal_t_minus_60", uses: ["a_vendor", "t_asana"] },
        ],
      },
    ],
  },
  {
    id: "dept_tech",
    name: "Tech, AI & Automations",
    business_function: "enabling",
    teams: [
      {
        id: "team_automation",
        name: "AI & Automation",
        lead: "Head of Engineering",
        roles: ["Automation Engineer", "ML Engineer"],
        agents: [
          { id: "a_orchestrator", name: "Workflow Orchestrator Agent", purpose: "Supervise and retry cross-team automations; surface failures to owners.", tools: ["t_github", "t_slack"] },
        ],
        sops: [
          { id: "sop_agent_review", name: "Agent Change Review SOP", summary: "Review, evaluation, and rollout checklist before changing a production agent's prompt or tools." },
        ],
        workflows: [
          { id: "wf_deploy", name: "Agent Deploy Workflow", trigger: "merge_to_main", uses: ["a_orchestrator", "t_github"] },
        ],
      },
    ],
  },
  {
    id: "dept_finance",
    name: "Finance",
    business_function: "enabling",
    teams: [
      {
        id: "team_finance",
        name: "Finance & Accounting",
        lead: "Head of Finance",
        roles: ["Financial Analyst"],
        agents: [
          { id: "a_revrec", name: "Revenue Recognition Agent", purpose: "Reconcile billing events and draft monthly revenue summaries.", tools: ["t_stripe", "t_snowflake"] },
        ],
        sops: [
          { id: "sop_close", name: "Monthly Close SOP", summary: "Steps and controls for the monthly financial close and reporting cycle." },
        ],
        workflows: [
          { id: "wf_close", name: "Monthly Close Workflow", trigger: "schedule_month_end", uses: ["a_revrec", "t_stripe", "t_snowflake"] },
        ],
      },
    ],
  },
  {
    id: "dept_data",
    name: "Data & Analytics",
    business_function: "enabling",
    teams: [
      {
        id: "team_analytics",
        name: "Analytics",
        lead: "Head of Data",
        roles: ["Analytics Engineer", "Data Analyst"],
        agents: [
          { id: "a_metrics", name: "Metrics QA Agent", purpose: "Detect anomalies in core metrics and annotate dashboards with likely causes.", tools: ["t_snowflake", "t_slack"] },
        ],
        sops: [
          { id: "sop_metric", name: "Metric Definition SOP", summary: "How new metrics are proposed, defined, certified, and published in the semantic layer." },
        ],
        workflows: [
          { id: "wf_anomaly", name: "Metric Anomaly Workflow", trigger: "daily_metric_load", uses: ["a_metrics", "t_snowflake"] },
        ],
      },
    ],
  },
  {
    id: "dept_hr",
    name: "Human Resources",
    business_function: "enabling",
    teams: [
      {
        id: "team_people",
        name: "People Ops",
        lead: "Head of People",
        roles: ["People Operations Specialist"],
        agents: [
          { id: "a_onboard", name: "Onboarding Agent", purpose: "Generate role-specific onboarding plans and provision access requests.", tools: ["t_asana", "t_slack"] },
        ],
        sops: [
          { id: "sop_onboard", name: "Employee Onboarding SOP", summary: "30-60-90 onboarding plan, access provisioning, and data-handling training requirements." },
        ],
        workflows: [
          { id: "wf_onboard", name: "New Hire Onboarding Workflow", trigger: "offer_accepted", uses: ["a_onboard", "t_asana"] },
        ],
      },
    ],
  },
  {
    id: "dept_legal",
    name: "Legal, Risk & Compliance",
    business_function: "enabling",
    teams: [
      {
        id: "team_legal",
        name: "Legal & Compliance",
        lead: "Head of Legal",
        roles: ["Compliance Manager"],
        agents: [
          { id: "a_dpa", name: "DPA Review Agent", purpose: "Triage incoming contracts for data-processing terms and flag GDPR risk.", tools: ["t_docusign", "t_slack"] },
        ],
        sops: [
          { id: "sop_gdpr", name: "GDPR Data Handling SOP", summary: "Lawful-basis, data-minimization, sub-processor DPA, and third-country transfer requirements for personal data (incl. BDSG specifics for German employee data)." },
        ],
        workflows: [
          { id: "wf_dpa", name: "Contract DPA Review Workflow", trigger: "new_contract", uses: ["a_dpa", "t_docusign"] },
        ],
      },
    ],
  },
];

// ── Tool nodes ──
const toolUsedBy: Record<string, string[]> = {};
for (const t of TOOLS) {
  addNode({
    id: t.id,
    type: "tool" as NodeType,
    name: t.name,
    department: null,
    business_function: null,
    content: `${t.name} — ${t.about}`,
    props: { kind: t.kind },
  });
  toolUsedBy[t.id] = [];
}

// ── CEO (root of the reporting tree) ──
const CEO_ID = "p_ceo";

for (const dept of DEPARTMENTS) {
  addNode({
    id: dept.id,
    type: "department",
    name: dept.name,
    department: dept.id,
    business_function: dept.business_function,
    content: `${dept.name} department. Business function: ${dept.business_function}. Contains ${dept.teams.length} team(s).`,
    props: { business_function: dept.business_function },
  });

  for (const team of dept.teams) {
    addNode({
      id: team.id,
      type: "team",
      name: team.name,
      department: dept.id,
      business_function: dept.business_function,
      content: `${team.name} team within ${dept.name}. Led by the ${team.lead}.`,
      props: { lead_role: team.lead },
    });
    addEdge(team.id, dept.id, "part_of");

    // Team lead (reports to CEO for simplicity of the tree).
    const leadId = `p_${team.id}_lead`;
    addNode({
      id: leadId,
      type: "person",
      name: team.lead,
      department: dept.id,
      business_function: dept.business_function,
      content: `${team.lead}, leading the ${team.name} team in ${dept.name}. Pseudonymous role node — no personal data stored.`,
      props: { role: team.lead, reports_to: CEO_ID },
    });
    addEdge(leadId, team.id, "member_of");
    addEdge(leadId, CEO_ID, "reports_to");

    // Individual contributors report to the lead.
    team.roles.forEach((role, i) => {
      const pid = `p_${team.id}_${i}`;
      addNode({
        id: pid,
        type: "person",
        name: role,
        department: dept.id,
        business_function: dept.business_function,
        content: `${role} on the ${team.name} team (${dept.name}). Pseudonymous role node.`,
        props: { role, reports_to: leadId },
      });
      addEdge(pid, team.id, "member_of");
      addEdge(pid, leadId, "reports_to");
    });

    // SOPs owned by the team.
    for (const sop of team.sops) {
      addNode({
        id: sop.id,
        type: "sop",
        name: sop.name,
        department: dept.id,
        business_function: dept.business_function,
        content: `${sop.name}. ${sop.summary} Owned by the ${team.name} team.`,
        props: { owner_team: team.id },
      });
      addEdge(team.id, sop.id, "owns");
    }

    // AI sub-agents.
    for (const agent of team.agents) {
      const followsSop = team.sops[0]?.id;
      addNode({
        id: agent.id,
        type: "subagent",
        name: agent.name,
        department: dept.id,
        business_function: dept.business_function,
        content: `${agent.name} is an AI sub-agent on the ${team.name} team. Purpose: ${agent.purpose} It is built on the Claude model and uses ${agent.tools.length} tool(s).`,
        props: {
          model: "claude-sonnet-4-6",
          purpose: agent.purpose,
          tools: agent.tools,
          team: team.id,
        },
      });
      addEdge(agent.id, team.id, "member_of");
      for (const tid of agent.tools) {
        addEdge(agent.id, tid, "uses");
        toolUsedBy[tid]?.push(agent.id);
      }
      if (followsSop) addEdge(agent.id, followsSop, "follows");
    }

    // Workflows wiring agents + tools together.
    for (const wf of team.workflows) {
      addNode({
        id: wf.id,
        type: "workflow",
        name: wf.name,
        department: dept.id,
        business_function: dept.business_function,
        content: `${wf.name} is an automated workflow on the ${team.name} team. Trigger: ${wf.trigger}. It orchestrates: ${wf.uses.join(", ")}.`,
        props: { trigger: wf.trigger, nodes: wf.uses },
      });
      for (const u of wf.uses) addEdge(wf.id, u, "part_of");
    }
  }
}

// CEO node + department head links.
addNode({
  id: CEO_ID,
  type: "person",
  name: "Chief Executive Officer",
  department: "dept_strategy",
  business_function: "core",
  content: "Chief Executive Officer. Root of the org reporting tree. Pseudonymous role node — no personal data stored.",
  props: { role: "Chief Executive Officer", reports_to: null },
});
addEdge(CEO_ID, "team_exec", "member_of");

// Update tool nodes with used_by for richer detail/RAG.
for (const t of TOOLS) {
  const node = nodes.find((n) => n.id === t.id);
  if (node) node.props.used_by = toolUsedBy[t.id];
}

const brain = { nodes, edges };

const outPath = resolve(__dirname, "../src/data/seed.json");
writeFileSync(outPath, JSON.stringify(brain, null, 2) + "\n");

console.log(
  `Wrote ${nodes.length} nodes and ${edges.length} edges to ${outPath}`,
);
