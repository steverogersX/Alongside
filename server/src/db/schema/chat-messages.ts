import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { agentRuns } from "@/db/schema/agent-runs.ts";
import { documentLinks } from "@/db/schema/document-links.ts";
import { documents } from "@/db/schema/documents.ts";
import { users } from "@/db/schema/users.ts";

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id),
    authorLinkId: uuid("author_link_id").references(() => documentLinks.id, {
      onDelete: "set null",
    }),
    authorVisitorId: text("author_visitor_id"),
    authorName: text("author_name"),
    body: text("body").notNull(),
    runId: uuid("run_id").references(() => agentRuns.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("chat_document_idx").on(table.documentId, table.createdAt),
    check(
      "chat_has_one_author",
      sql`(${table.authorId} is not null) <> (${table.authorVisitorId} is not null)`
    ),
  ]
);
