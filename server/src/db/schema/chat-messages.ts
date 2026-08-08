import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { agentRuns } from "@/db/schema/agent-runs.ts";
import { documents } from "@/db/schema/documents.ts";
import { users } from "@/db/schema/users.ts";

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    runId: uuid("run_id").references(() => agentRuns.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("chat_document_idx").on(table.documentId, table.createdAt)]
);
