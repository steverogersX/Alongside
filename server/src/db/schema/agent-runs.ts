import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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
    invokedBy: uuid("invoked_by")
      .notNull()
      .references(() => users.id),
    prompt: text("prompt").notNull(),
    ceiling: roleName("ceiling").notNull(),
    status: runStatus("status").notNull().default("running"),
    proposal: jsonb("proposal"),
    summary: text("summary"),
    decidedBy: uuid("decided_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [index("runs_document_idx").on(table.documentId, table.createdAt)]
);
