
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
