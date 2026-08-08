
export type Person = {
  id: string;
  name: string;
  initials: string;
  kind: "human" | "agent";
  model?: string;
  status: "active" | "idle" | "offline";
};

export type Workspace = {
  id: string;
  name: string;
  purpose: string;
  members: Person[];
  updatedAt: string;
  live?: { actor: string; doing: string };
  docs: number;
  unread: number;
};

export type ActivityItem = {
  id: string;
  actor: Person;
  verb: string;
  target: string;
  workspace: string;
  at: string;
};

export const VIEWER: Person = {
  id: "u_you",
  name: "Pavan",
  initials: "PV",
  kind: "human",
  status: "active",
};

const p = (
  id: string,
  name: string,
  initials: string,
  status: Person["status"] = "active"
): Person => ({ id, name, initials, kind: "human", status });

const a = (
  id: string,
  name: string,
  initials: string,
  model: string,
  status: Person["status"] = "active"
): Person => ({ id, name, initials, kind: "agent", model, status });

export const WORKSPACES: Workspace[] = [
  {
    id: "ws_msa",
    name: "Enterprise MSA",
    purpose: "Renewal terms, redlines, and the counterparty thread.",
    members: [
      p("u_sam", "Sam Ortega", "SO"),
      p("u_noor", "Noor Haddad", "NH", "idle"),
      a("a_claude", "Claude", "CL", "Opus 5"),
    ],
    updatedAt: "2 min ago",
    live: { actor: "Claude", doing: "drafting §4.2 liability cap" },
    docs: 12,
    unread: 3,
  },
  {
    id: "ws_q3",
    name: "Q3 Launch",
    purpose: "Positioning, launch checklist, and the press brief.",
    members: [
      p("u_you", "Pavan", "PV"),
      p("u_ida", "Ida Novak", "IN"),
      p("u_rey", "Rey Alcantara", "RA", "offline"),
      a("a_scout", "Scout", "SC", "Sonnet 5", "idle"),
    ],
    updatedAt: "18 min ago",
    docs: 34,
    unread: 0,
  },
  {
    id: "ws_research",
    name: "Market Research",
    purpose: "Competitor teardowns and the weekly signal digest.",
    members: [
      p("u_ida", "Ida Novak", "IN", "idle"),
      a("a_atlas", "Atlas", "AT", "Opus 5"),
      a("a_digest", "Digest", "DG", "Haiku 4.5"),
    ],
    updatedAt: "1 hour ago",
    live: { actor: "Atlas", doing: "reading 9 sources" },
    docs: 61,
    unread: 7,
  },
  {
    id: "ws_platform",
    name: "Platform Eng",
    purpose: "Migration plan, incident notes, and on-call handoffs.",
    members: [
      p("u_rey", "Rey Alcantara", "RA"),
      p("u_sam", "Sam Ortega", "SO", "idle"),
      p("u_tao", "Tao Lin", "TL", "offline"),
      a("a_patch", "Patch", "PT", "Sonnet 5", "idle"),
    ],
    updatedAt: "yesterday",
    docs: 87,
    unread: 0,
  },
  {
    id: "ws_design",
    name: "Design Review",
    purpose: "Critique threads and the component inventory.",
    members: [
      p("u_noor", "Noor Haddad", "NH"),
      p("u_you", "Pavan", "PV", "idle"),
      a("a_critic", "Critic", "CR", "Opus 5", "offline"),
    ],
    updatedAt: "2 days ago",
    docs: 23,
    unread: 1,
  },
  {
    id: "ws_hiring",
    name: "Hiring Loop",
    purpose: "Scorecards, debriefs, and the offer tracker.",
    members: [
      p("u_ida", "Ida Novak", "IN", "offline"),
      a("a_screen", "Screener", "SR", "Haiku 4.5", "idle"),
    ],
    updatedAt: "4 days ago",
    docs: 15,
    unread: 0,
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    id: "ev1",
    actor: a("a_claude", "Claude", "CL", "Opus 5"),
    verb: "claimed",
    target: "§4.2 Limitation of Liability",
    workspace: "Enterprise MSA",
    at: "2m",
  },
  {
    id: "ev2",
    actor: p("u_sam", "Sam Ortega", "SO"),
    verb: "took over from Claude in",
    target: "Renewal cover note",
    workspace: "Enterprise MSA",
    at: "9m",
  },
  {
    id: "ev3",
    actor: a("a_atlas", "Atlas", "AT", "Opus 5"),
    verb: "published",
    target: "Competitor teardown — Q3",
    workspace: "Market Research",
    at: "24m",
  },
  {
    id: "ev4",
    actor: p("u_ida", "Ida Novak", "IN"),
    verb: "invited",
    target: "Scout to the workspace",
    workspace: "Q3 Launch",
    at: "1h",
  },
  {
    id: "ev5",
    actor: a("a_patch", "Patch", "PT", "Sonnet 5"),
    verb: "opened a proposal on",
    target: "Migration runbook",
    workspace: "Platform Eng",
    at: "3h",
  },
  {
    id: "ev6",
    actor: p("u_noor", "Noor Haddad", "NH"),
    verb: "resolved 4 comments in",
    target: "Component inventory",
    workspace: "Design Review",
    at: "5h",
  },
];

export type Doc = {
  id: string;
  title: string;
  excerpt: string;
  status: "draft" | "in review" | "final";
  editors: string[];
  claim?: { actor: string; region: string };
  comments: number;
  updatedAt: string;
};

export const DOCS: Record<string, Doc[]> = {
  ws_msa: [
    {
      id: "d_terms",
      title: "MSA — renewal terms",
      excerpt:
        "Clause-by-clause redline against the 2024 agreement, with the counterparty's markup merged.",
      status: "in review",
      editors: ["u_sam", "a_claude", "u_noor"],
      claim: { actor: "Claude", region: "§4.2 Limitation of Liability" },
      comments: 14,
      updatedAt: "2 min ago",
    },
    {
      id: "d_cover",
      title: "Renewal cover note",
      excerpt:
        "One page to legal summarising what moved and what we conceded on.",
      status: "draft",
      editors: ["u_sam"],
      comments: 3,
      updatedAt: "9 min ago",
    },
    {
      id: "d_matrix",
      title: "Concession matrix",
      excerpt:
        "Every ask from the counterparty, our position, and the walk-away line.",
      status: "in review",
      editors: ["u_noor", "a_claude"],
      comments: 8,
      updatedAt: "1 hour ago",
    },
    {
      id: "d_sec",
      title: "Security addendum",
      excerpt: "Subprocessor list and the incident-notification window.",
      status: "final",
      editors: ["u_noor"],
      comments: 0,
      updatedAt: "3 days ago",
    },
  ],
  ws_q3: [
    {
      id: "d_pos",
      title: "Positioning brief",
      excerpt: "Who it's for, what it replaces, and the one sentence we lead with.",
      status: "in review",
      editors: ["u_ida", "u_you"],
      comments: 21,
      updatedAt: "18 min ago",
    },
    {
      id: "d_check",
      title: "Launch checklist",
      excerpt: "Every gate from code freeze to press embargo lift.",
      status: "draft",
      editors: ["u_rey", "a_scout"],
      comments: 6,
      updatedAt: "2 hours ago",
    },
    {
      id: "d_press",
      title: "Press brief",
      excerpt: "Boilerplate, quotes, and the embargo terms.",
      status: "draft",
      editors: ["u_ida"],
      comments: 2,
      updatedAt: "yesterday",
    },
  ],
  ws_research: [
    {
      id: "d_teardown",
      title: "Competitor teardown — Q3",
      excerpt: "Nine products, feature-by-feature, with pricing pulled from public pages.",
      status: "final",
      editors: ["a_atlas", "u_ida"],
      claim: { actor: "Atlas", region: "Appendix B — sources" },
      comments: 11,
      updatedAt: "24 min ago",
    },
    {
      id: "d_digest",
      title: "Weekly signal digest",
      excerpt: "What moved in the market, filtered to things that change our roadmap.",
      status: "draft",
      editors: ["a_digest"],
      comments: 0,
      updatedAt: "1 hour ago",
    },
  ],
  ws_platform: [
    {
      id: "d_runbook",
      title: "Migration runbook",
      excerpt: "Cutover steps, rollback triggers, and who holds the pager at each stage.",
      status: "in review",
      editors: ["u_rey", "a_patch"],
      comments: 19,
      updatedAt: "3 hours ago",
    },
    {
      id: "d_incident",
      title: "Incident notes — 08/02",
      excerpt: "Timeline, blast radius, and the three follow-ups that came out of it.",
      status: "final",
      editors: ["u_sam", "u_tao"],
      comments: 5,
      updatedAt: "yesterday",
    },
  ],
  ws_design: [
    {
      id: "d_inventory",
      title: "Component inventory",
      excerpt: "Every component in the system, its owner, and whether it's been reviewed.",
      status: "in review",
      editors: ["u_noor", "a_critic"],
      comments: 4,
      updatedAt: "2 days ago",
    },
  ],
  ws_hiring: [
    {
      id: "d_scorecard",
      title: "Scorecard — platform eng",
      excerpt: "The four signals we grade on and what strong looks like for each.",
      status: "final",
      editors: ["u_ida"],
      comments: 1,
      updatedAt: "4 days ago",
    },
    {
      id: "d_offers",
      title: "Offer tracker",
      excerpt: "Every candidate in flight, stage, and the decision date.",
      status: "draft",
      editors: ["u_ida", "a_screen"],
      comments: 0,
      updatedAt: "5 days ago",
    },
  ],
};

export function getWorkspace(id: string) {
  return WORKSPACES.find((ws) => ws.id === id);
}

export function getDocs(id: string) {
  return DOCS[id] ?? [];
}

export type AgentDetail = {
  scope: string;
  permissions: string[];
  runs: number;
  lastRun: string;
  accepted: number;
};

export const AGENT_DETAILS: Record<string, AgentDetail> = {
  a_claude: {
    scope: "Contract drafting and clause comparison",
    permissions: ["Read docs", "Propose edits", "Comment"],
    runs: 148,
    lastRun: "2 min ago",
    accepted: 91,
  },
  a_scout: {
    scope: "Launch checklist upkeep and gate reminders",
    permissions: ["Read docs", "Comment"],
    runs: 62,
    lastRun: "2 hours ago",
    accepted: 84,
  },
  a_atlas: {
    scope: "Competitor research from public sources",
    permissions: ["Read docs", "Propose edits", "Fetch web"],
    runs: 210,
    lastRun: "24 min ago",
    accepted: 88,
  },
  a_digest: {
    scope: "Weekly market digest",
    permissions: ["Read docs", "Fetch web"],
    runs: 34,
    lastRun: "1 hour ago",
    accepted: 96,
  },
  a_patch: {
    scope: "Runbook drafting and incident write-ups",
    permissions: ["Read docs", "Propose edits"],
    runs: 77,
    lastRun: "3 hours ago",
    accepted: 79,
  },
  a_critic: {
    scope: "Design critique against the component inventory",
    permissions: ["Read docs", "Comment"],
    runs: 41,
    lastRun: "2 days ago",
    accepted: 73,
  },
  a_screen: {
    scope: "Resume screening against the scorecard",
    permissions: ["Read docs", "Comment"],
    runs: 305,
    lastRun: "4 days ago",
    accepted: 68,
  },
};

export type Block = {
  id: string;
  kind: "h2" | "p";
  text: string;
  claimedBy?: string;
  attribution?: { actor: string; note: string };
};

export type RunStep = {
  id: string;
  actor: string;
  label: string;
  detail: string;
  state: "done" | "running";
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  anchor: string;
  at: string;
  resolved: boolean;
};

export type DocDetail = {
  blocks: Block[];
  steps: RunStep[];
  comments: Comment[];
};

