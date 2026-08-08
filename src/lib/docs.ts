import {
  WORKSPACES,
  getDocs,
  type Block,
  type Doc,
  type DocDetail,
  type Person,
  type RunStep,
} from "@/lib/data";

const h = (id: string, text: string): Block => ({ id, kind: "h2", text });

const b = (id: string, text: string, claimedBy?: string): Block => ({
  id,
  kind: "p",
  text,
  ...(claimedBy ? { claimedBy } : {}),
});

const steps = (
  actor: string,
  read: string,
  found: string,
  doing?: string
): RunStep[] => [
  { id: "s1", actor, label: "Read the document", detail: read, state: "done" },
  { id: "s2", actor, label: "Gathered context", detail: found, state: "done" },
  ...(doing
    ? [
        {
          id: "s3",
          actor,
          label: "Drafting",
          detail: doing,
          state: "running" as const,
        },
      ]
    : []),
];

export const DOC_DETAILS: Record<string, DocDetail> = {
  d_terms: {
    blocks: [
      h("h1", "Where we landed"),
      b(
        "p1",
        "We are renewing for another twelve months on substantially the same commercial terms. Three things moved: the liability cap, the notice period, and the security addendum. Everything else carries over from the 2024 agreement untouched, which is worth saying plainly because it saves both legal teams a re-read they do not need to do."
      ),
      b(
        "p2",
        "The negotiation took four weeks, most of it spent on a single number. Their procurement team opened at two times trailing fees and held there for two rounds. We have never signed above one times, and the last six deals we pulled all settled between one and one and a half. That gave us a defensible middle rather than a position we invented at the table."
      ),
      h("h2", "The liability cap"),
      b(
        "p3",
        "We are proposing one hundred and fifty percent of the fees paid in the twelve months before the claim. That is above our standard but below their opening ask, and it matches four of the six comparable agreements we reviewed. In exchange we kept the carve-outs narrow, which is the part that actually determines our exposure.",
        "Claude"
      ),
      b(
        "p4",
        "The carve-outs are unchanged: death or personal injury caused by negligence, fraud, and anything that cannot lawfully be limited. These are standard and their counsel did not contest them. Keeping this paragraph verbatim from last year means neither side has to re-litigate what is already settled."
      ),
      h("h2", "Notice and termination"),
      b(
        "p5",
        "Either side can decline renewal with sixty days written notice, up from thirty. Their team asked for the longer window so their finance group can plan around it, and we had no reason to refuse. Material breach still carries a thirty day cure period, which we did not move on and they did not push."
      ),
      b(
        "p6",
        "The remaining open item is the incident-notification window. Security signed off on seventy-two hours; the counterparty is pushing for twenty-four. That thread is still live and is the only thing standing between this draft and a signature."
      ),
    ],
    steps: steps(
      "Claude",
      "6 sections, 2,140 words",
      "6 comparable agreements, 4 settled at 1.5x",
      "Proposing 150% of trailing fees"
    ),
    comments: [
      {
        id: "c1",
        author: "u_noor",
        body: "150% is defensible, but flag it to legal before this goes back to them.",
        anchor: "cap",
        at: "4m",
        resolved: false,
      },
      {
        id: "c2",
        author: "u_sam",
        body: "Agreed. Leave the carve-outs exactly as they are — that language took a week last year.",
        anchor: "carve-outs",
        at: "2m",
        resolved: false,
      },
      {
        id: "c3",
        author: "u_sam",
        body: "Cure period stays at 30 days. They already agreed in writing.",
        anchor: "notice",
        at: "1h",
        resolved: true,
      },
    ],
  },

  d_cover: {
    blocks: [
      h("h1", "Summary for legal"),
      b(
        "p1",
        "This note covers what changed in the renewal and why, so you do not have to diff the two agreements yourself. Read this first; the redline is attached for the detail."
      ),
      b(
        "p2",
        "Three substantive changes. The liability cap moves from one times to one and a half times trailing fees. The renewal notice period doubles from thirty to sixty days. The security addendum gains a subprocessor list that we now have to keep current, which is an operational commitment more than a legal one."
      ),
      b(
        "p3",
        "What we conceded: the cap, and only the cap. It is the single number their procurement team was measured on, and trading it bought us silence on indemnities and on the audit clause, both of which we expected to fight over and did not."
      ),
      b(
        "p4",
        "What we held: the liability carve-outs, the thirty day cure period, and the governing-law clause. None of these were seriously contested once the cap moved, which is roughly what we predicted going in."
      ),
    ],
    steps: steps(
      "Claude",
      "4 sections, 620 words",
      "Diffed against the 2024 agreement"
    ),
    comments: [
      {
        id: "c1",
        author: "u_noor",
        body: "Add a line on the subprocessor list — who owns keeping it current?",
        anchor: "changes",
        at: "20m",
        resolved: false,
      },
    ],
  },

  d_matrix: {
    blocks: [
      h("h1", "How to read this"),
      b(
        "p1",
        "Every ask the counterparty made is listed with our position and the point at which we walk. The walk-away lines were agreed with finance before negotiation opened, which is the only reason they are worth anything — a limit invented mid-negotiation is not a limit."
      ),
      b(
        "p2",
        "Liability cap: they opened at two times, we opened at one times, we walk above one and a half. Settled at one and a half, which is the edge of the range but inside it."
      ),
      b(
        "p3",
        "Payment terms: they asked for net ninety, we hold at net forty-five. This one is not really negotiable — our own working capital assumptions are built on it, and stretching to ninety costs more than the renewal is worth."
      ),
      b(
        "p4",
        "Audit rights: they asked for annual on-site, we offered annual report plus on-site for cause. They accepted the counter without a second round, which suggests the ask was procedural rather than something they actually wanted."
      ),
    ],
    steps: steps(
      "Claude",
      "12 line items, 1,100 words",
      "Cross-checked against 6 prior deals"
    ),
    comments: [
      {
        id: "c1",
        author: "u_noor",
        body: "Net 45 needs finance to re-confirm — that number is from January.",
        anchor: "payment",
        at: "1h",
        resolved: false,
      },
    ],
  },

  d_sec: {
    blocks: [
      h("h1", "Scope"),
      b(
        "p1",
        "This addendum covers how we handle their data, who else touches it, and what happens when something goes wrong. It sits alongside the main agreement and survives termination for as long as we hold any of their data."
      ),
      b(
        "p2",
        "The subprocessor list is the operational commitment here. Any new subprocessor requires thirty days notice before it starts handling their data, and they can object in that window. Practically this means the list has to be maintained deliberately rather than discovered during an audit."
      ),
      b(
        "p3",
        "Incident notification is the one open question. Our security team committed to seventy-two hours, which is what our internal process can actually meet. Twenty-four hours is achievable only for incidents we detect immediately, and committing to it for everything would mean committing to something we cannot reliably do."
      ),
    ],
    steps: steps(
      "Claude",
      "3 sections, 780 words",
      "Checked against our current data processing terms"
    ),
    comments: [],
  },

  d_pos: {
    blocks: [
      h("h1", "Who this is for"),
      b(
        "p1",
        "Teams that have already adopted AI tools individually and are now discovering that individual adoption does not compose. Everyone has their own assistant, their own context, their own half-finished thread — and none of it is visible to anyone else. The work happens in private and then gets pasted into shared documents, which is where the value leaks out."
      ),
      b(
        "p2",
        "The specific person is a lead who can see this happening and cannot point at what is wrong. They are not looking for a better model. They are looking for the work to stop disappearing into private chats."
      ),
      h("h2", "What it replaces"),
      b(
        "p3",
        "Not the assistant. The copy-paste between the assistant and the place the work actually lives. Today that gap is filled by a person manually moving text between two windows and losing every trace of where it came from. That is the thing we remove."
      ),
      b(
        "p4",
        "Three candidate lines for the top of the page. First: agents that work where your team already works. Second: stop pasting between the chat and the doc. Third: your team, plus theirs, in one document. The second is the most concrete and the least aspirational, which historically is the one that tests best for us."
      ),
      h("h2", "What we do not claim"),
      b(
        "p5",
        "We do not claim the agent is autonomous, because it is not, and pretending otherwise sets up a disappointment on day two. Agents propose; people accept. That constraint is a feature and the positioning should lead with it rather than hide it."
      ),
    ],
    steps: steps(
      "Scout",
      "5 sections, 1,340 words",
      "Scored 3 candidate lines against 2 prior launches"
    ),
    comments: [
      {
        id: "c1",
        author: "u_you",
        body: "Line two. It's the only one that says what actually happens.",
        anchor: "candidates",
        at: "35m",
        resolved: false,
      },
      {
        id: "c2",
        author: "u_ida",
        body: "Agreed, but test it against line one with the enterprise segment first.",
        anchor: "candidates",
        at: "30m",
        resolved: false,
      },
    ],
  },

  d_check: {
    blocks: [
      h("h1", "Gates"),
      b(
        "p1",
        "Every item here blocks the one after it. If a gate slips, the launch date slips with it — we are not running the pattern where three gates fail quietly and the date holds anyway until the morning of."
      ),
      b(
        "p2",
        "Code freeze lands the Thursday before. Nothing ships to production after that except a fix for something the freeze itself broke. This is the gate that has moved on both previous launches, and both times it moved because we set it too close to the date."
      ),
      b(
        "p3",
        "Docs and the press brief have to be final the same day as the freeze, not after it. Writing the announcement while the product is still moving is how we ended up describing a feature that shipped differently last time."
      ),
      b(
        "p4",
        "The embargo lifts Tuesday morning. Whether that is six or nine Eastern is still open: six catches the European desks, nine catches the US morning shows. We cannot have both, and the decision needs to be made this week rather than on the day."
      ),
    ],
    steps: steps(
      "Scout",
      "14 gates, 890 words",
      "Compared against the last 2 launch checklists"
    ),
    comments: [
      {
        id: "c1",
        author: "u_rey",
        body: "Freeze on Thursday means QA has one day. Make it Wednesday.",
        anchor: "freeze",
        at: "2h",
        resolved: false,
      },
    ],
  },

  d_press: {
    blocks: [
      h("h1", "The announcement"),
      b(
        "p1",
        "One page, three paragraphs, no adjectives that cannot be defended. The trade press will reprint the first paragraph nearly verbatim, so it has to carry the whole story on its own."
      ),
      b(
        "p2",
        "Lead with the problem, not the product: teams are running AI tools in private windows and losing the work in between. Then the change: the agent joins the document instead of the document coming to the agent. Then the constraint, stated plainly, because it is what makes the claim credible rather than promotional."
      ),
      b(
        "p3",
        "Quotes should come from someone who used it, not from us. A customer sentence about the thing they stopped doing is worth more than any executive line about what we believe."
      ),
    ],
    steps: steps(
      "Scout",
      "3 sections, 540 words",
      "Pulled boilerplate from the last release"
    ),
    comments: [],
  },

  d_teardown: {
    blocks: [
      h("h1", "What we looked at"),
      b(
        "p1",
        "Nine products, all of which claim some version of collaborative AI. Everything here comes from public pages, published pricing, and trial accounts. Where a number could not be sourced it is marked unknown rather than estimated, because an estimate in this table would be indistinguishable from a fact three weeks from now."
      ),
      b(
        "p2",
        "The pattern across all nine is the same: the agent lives in a panel beside the work rather than inside it. You ask the panel, it answers, you copy the answer across. Six of the nine shipped this exact shape in the last year, which tells us it is the obvious first move and not a durable position.",
        "Atlas"
      ),
      h("h2", "Where they differ"),
      b(
        "p3",
        "Pricing splits cleanly into two camps. Four charge per seat and treat the agent as a feature of the seat. Five charge per agent or per run, which reads better on a pricing page and worse on an invoice once a team actually uses it."
      ),
      b(
        "p4",
        "Only two do anything meaningful about attribution. The rest write into the document with no record of which sentences came from the model, which is fine in a draft and a serious problem in anything reviewed or audited. That gap is the most defensible thing in this table."
      ),
      h("h2", "What it means for us"),
      b(
        "p5",
        "Being in the document rather than beside it is genuinely differentiated today, and probably for two or three quarters. Attribution is differentiated for longer, because it is a product decision the others would have to retrofit through their whole editing stack."
      ),
    ],
    steps: steps(
      "Atlas",
      "9 products, 4,200 words",
      "Read 34 public sources and 9 pricing pages",
      "Compiling the source list"
    ),
    comments: [
      {
        id: "c1",
        author: "u_ida",
        body: "Cite the pricing claim or cut it — case studies aren't evidence.",
        anchor: "pricing",
        at: "18m",
        resolved: false,
      },
    ],
  },

  d_digest: {
    blocks: [
      h("h1", "This week"),
      b(
        "p1",
        "Three things moved that change something for us. Everything else was noise and has been left out deliberately — a digest that lists everything is a feed, and we already have one of those."
      ),
      b(
        "p2",
        "Two competitors shipped inline agent editing within a week of each other. Neither has attribution. This is the second time this quarter that a feature we considered differentiated turned out to be on everyone's roadmap simultaneously, which is a useful signal about how much lead time to assume."
      ),
      b(
        "p3",
        "Pricing pressure is showing up at the low end. One product dropped its per-seat price by roughly a third while keeping agent runs metered separately. That is a bet that teams read the seat price and ignore the meter, and it will be worth watching whether it holds through renewal season."
      ),
    ],
    steps: steps("Digest", "1 section, 410 words", "Scanned 60 sources, kept 3"),
    comments: [],
  },

  d_runbook: {
    blocks: [
      h("h1", "Before you start"),
      b(
        "p1",
        "This runbook assumes the migration is happening during a low-traffic window with two people on call, one driving and one watching graphs. If either of those is not true, stop and reschedule. Most of the incidents this document exists to prevent came from running a cutover with one person who was also answering questions in chat."
      ),
      b(
        "p2",
        "Read the whole thing before executing any of it. Several steps are irreversible after the point marked in section four, and knowing which ones those are while you are still in section two is the difference between a rollback and an incident."
      ),
      h("h2", "Cutover"),
      b(
        "p3",
        "Traffic moves in three stages: five percent, fifty percent, then everything. Hold at each stage for a full fifteen minutes regardless of how good the graphs look. The failure mode we are guarding against does not appear in the first two minutes, which is exactly why the temptation to skip ahead is strongest then."
      ),
      b(
        "p4",
        "The rollback trigger is still being decided. Error rate is easier to reason about and fires late. Latency fires earlier but is noisy enough that it will trip on something unrelated at least once. The current proposal is latency at the ninety-ninth percentile over a two-minute sustained window, which is a compromise rather than a clean answer."
      ),
      h("h2", "After"),
      b(
        "p5",
        "Leave the old path running for twenty-four hours before decommissioning anything. The cost of keeping it warm for a day is trivial next to the cost of discovering an undocumented dependency at two in the morning."
      ),
    ],
    steps: steps(
      "Patch",
      "5 sections, 1,620 words",
      "Reviewed 3 prior migrations and 2 incident reports"
    ),
    comments: [
      {
        id: "c1",
        author: "u_tao",
        body: "P99 latency will trip on the nightly batch. Exclude that window or pick error rate.",
        anchor: "rollback",
        at: "3h",
        resolved: false,
      },
      {
        id: "c2",
        author: "u_rey",
        body: "Good catch. Let's talk it through before this goes to review.",
        anchor: "rollback",
        at: "3h",
        resolved: false,
      },
    ],
  },

  d_incident: {
    blocks: [
      h("h1", "What happened"),
      b(
        "p1",
        "For fifty-one minutes on the second, roughly eight percent of requests to the document service returned errors. The cause was a connection pool sized for the old traffic shape and never revisited after the migration doubled concurrent editors per document."
      ),
      b(
        "p2",
        "It was detected by a customer, not by us, which is the more serious finding. Our alerting watches aggregate error rate across all services, and eight percent of one service does not move that number enough to fire."
      ),
      h("h2", "Follow-ups"),
      b(
        "p3",
        "Three things came out of this. Per-service error budgets rather than an aggregate. A review of every pool size that predates the migration. And a standing item in the runbook to check capacity assumptions made before the thing being migrated changed shape."
      ),
      b(
        "p4",
        "No blame attaches to the pool size. It was correct when it was set. The gap is that nothing in our process asks whether an old assumption still holds after a change large enough to invalidate it."
      ),
    ],
    steps: steps(
      "Patch",
      "4 sections, 970 words",
      "Correlated 3 alert streams with the deploy log"
    ),
    comments: [],
  },

  d_inventory: {
    blocks: [
      h("h1", "Purpose"),
      b(
        "p1",
        "One list of every component, who owns it, and whether it has been through review. The list exists because we kept building the same button three times, and each version was defensible on its own and indefensible next to the other two."
      ),
      b(
        "p2",
        "A component enters this inventory once it is used in more than one place. Below that bar it is local to a screen and does not need an owner, a review, or a row in this table. Inventorying everything is how these documents die."
      ),
      h("h2", "The open question"),
      b(
        "p3",
        "We currently have two surface tokens: the page and the raised card. On the new panelled layout that is not enough — a card sitting on a panel has to be distinguishable from the panel itself, and right now it is only distinguishable by border. A third token would resolve it cleanly, at the cost of one more thing everyone has to hold in their head."
      ),
    ],
    steps: steps(
      "Critic",
      "3 sections, 700 words",
      "Checked 41 components against the review log"
    ),
    comments: [
      {
        id: "c1",
        author: "u_noor",
        body: "Try elevation before adding a token. We might not need one.",
        anchor: "surfaces",
        at: "2d",
        resolved: false,
      },
    ],
  },

  d_scorecard: {
    blocks: [
      h("h1", "What we grade"),
      b(
        "p1",
        "Four signals, graded independently, written down before the debrief. The order matters: writing the grade before hearing anyone else's is the only mechanism here that actually does anything, and skipping it turns the whole exercise into consensus theatre."
      ),
      b(
        "p2",
        "Systems design is the signal we are least calibrated on. Two panels graded the same debrief a full point apart last month, and both grades were defensible given what each panel weighted. That is a definition problem, not a panel problem."
      ),
      b(
        "p3",
        "Strong looks like this: the candidate names a constraint nobody gave them, then designs around it. Not the number of boxes on the whiteboard, and not whether they reached the answer we had in mind — we have hired people who reached a different answer and were right."
      ),
    ],
    steps: steps("Screener", "4 sections, 820 words", "Compared 12 recent debriefs"),
    comments: [],
  },

  d_offers: {
    blocks: [
      h("h1", "In flight"),
      b(
        "p1",
        "Every candidate past the first round, their stage, and the date a decision is owed. The decision date is the important column — a candidate sitting in a stage with no date attached is a candidate we are going to lose to somebody who moved faster."
      ),
      b(
        "p2",
        "Two offers are out and both are inside their consideration window. Three candidates are at debrief with dates this week. One has been at reference check for eleven days, which is our own delay and needs closing today."
      ),
    ],
    steps: steps("Screener", "2 sections, 380 words", "Pulled stage data from the tracker"),
    comments: [],
  },
};

export function getDoc(workspaceId: string, docId: string) {
  return getDocs(workspaceId).find((d) => d.id === docId);
}

export function getDocDetail(doc: Doc): DocDetail {
  const detail = DOC_DETAILS[doc.id];
  if (detail) return detail;

  return {
    blocks: [
      h("h1", "Nothing here yet"),
      b("p1", doc.excerpt),
      b(
        "p2",
        "This document has not been started. Write the first section yourself, or ask an agent to draft one — whoever moves first holds the pen, and the other side steps back without being asked."
      ),
    ],
    steps: [],
    comments: [],
  };
}

export function findPerson(id: string): Person | undefined {
  for (const ws of WORKSPACES) {
    const hit = ws.members.find((m) => m.id === id);
    if (hit) return hit;
  }
  return undefined;
}
