import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { documents } from "@/db/schema/documents.ts";
import { roleName } from "@/db/schema/enums.ts";
import { users } from "@/db/schema/users.ts";
import { workspaces } from "@/db/schema/workspaces.ts";

export const grants = pgTable(
  "grants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "cascade",
    }),
    role: roleName("role").notNull(),
    grantedBy: uuid("granted_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("grants_user_workspace_key")
      .on(table.userId, table.workspaceId)
      .where(sql`${table.workspaceId} is not null`),
    uniqueIndex("grants_user_document_key")
      .on(table.userId, table.documentId)
      .where(sql`${table.documentId} is not null`),
    index("grants_workspace_idx").on(table.workspaceId),
    index("grants_document_idx").on(table.documentId),
    check(
      "one_resource",
      sql`(${table.workspaceId} is not null)::int + (${table.documentId} is not null)::int = 1`
    ),
  ]
);
