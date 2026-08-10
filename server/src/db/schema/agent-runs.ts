import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { agentConnections } from "@/db/schema/agent-connections.ts";
import { documentLinks } from "@/db/schema/document-links.ts";
import { documents } from "@/db/schema/documents.ts";
import { roleName, runStatus } from "@/db/schema/enums.ts";
import { users } from "@/db/schema/users.ts";

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => users.id),
    /**
     * A run is asked for by a member or by a guest holding a share link with
     * chat write — the same either-or the chat messages themselves carry.
     */
    invokedBy: uuid("invoked_by").references(() => users.id),
    invokedByLinkId: uuid("invoked_by_link_id").references(
      () => documentLinks.id,
      { onDelete: "set null" }
    ),
    invokedByVisitorId: text("invoked_by_visitor_id"),
    invokedByName: text("invoked_by_name"),
    prompt: text("prompt").notNull(),
    ceiling: roleName("ceiling").notNull(),
    status: runStatus("status").notNull().default("queued"),
    proposal: jsonb("proposal"),
    summary: text("summary"),
    error: text("error"),
    decidedBy: uuid("decided_by").references(() => users.id),
    triggerMessageId: uuid("trigger_message_id"),
    connectionId: uuid("connection_id").references(() => agentConnections.id, {
      onDelete: "set null",
    }),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [
    index("runs_document_idx").on(table.documentId, table.createdAt),
    check(
      "runs_have_one_invoker",
      sql`(${table.invokedBy} is not null) <> (${table.invokedByVisitorId} is not null)`
    ),
  ]
);
