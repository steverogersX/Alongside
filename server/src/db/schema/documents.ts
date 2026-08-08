import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { docStatus } from "@/db/schema/enums.ts";
import { users } from "@/db/schema/users.ts";
import { workspaces } from "@/db/schema/workspaces.ts";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: docStatus("status").notNull().default("draft"),
    content: jsonb("content")
      .notNull()
      .default(sql`'{"type":"doc","content":[]}'::jsonb`),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("documents_workspace_idx").on(table.workspaceId)]
);
